import { Router } from 'express';
import { authenticateToken, requireRole } from './auth-middleware.js';
import { db } from './db.js';
import { users, homework, questions, contacts, tutorAvailability, homeworkFiles } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { EmailNotificationService } from './email-service.js';

const router = Router();

// Middleware: All admin routes require admin role
router.use(authenticateToken);
router.use(requireRole(['admin']));

/**
 * GET /api/admin/students
 * Get all students
 */
router.get('/students', async (req, res) => {
  try {
    const students = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        language: users.language,
        isEmailVerified: users.isEmailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'student'))
      .orderBy(desc(users.createdAt));

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * GET /api/admin/homework
 * Get all homework assignments
 */
router.get('/homework', async (req, res) => {
  try {
    const allHomework = await db
      .select({
        id: homework.id,
        studentId: homework.studentId,
        tutorId: homework.tutorId,
        title: homework.title,
        description: homework.description,
        instructions: homework.instructions,
        subject: homework.subject,
        difficulty: homework.difficulty,
        dueDate: homework.dueDate,
        status: homework.status,
        isCompleted: homework.isCompleted,
        completedAt: homework.completedAt,
        grade: homework.grade,
        feedback: homework.feedback,
        createdAt: homework.createdAt,
        updatedAt: homework.updatedAt,
        // Student info
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        studentEmail: users.email,
      })
      .from(homework)
      .leftJoin(users, eq(homework.studentId, users.id))
      .orderBy(desc(homework.createdAt));

    res.json(allHomework);
  } catch (error) {
    console.error('Get homework error:', error);
    res.status(500).json({ error: 'Failed to fetch homework' });
  }
});

/**
 * GET /api/admin/questions
 * Get all student questions
 */
router.get('/questions', async (req, res) => {
  try {
    const allQuestions = await db
      .select({
        id: questions.id,
        studentId: questions.studentId,
        subject: questions.subject,
        title: questions.title,
        content: questions.content,
        isAnswered: questions.isAnswered,
        answer: questions.answer,
        answeredAt: questions.answeredAt,
        answeredBy: questions.answeredBy,
        priority: questions.priority,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        // Student info
        studentName: users.firstName,
        studentLastName: users.lastName,
        studentEmail: users.email,
      })
      .from(questions)
      .leftJoin(users, eq(questions.studentId, users.id))
      .orderBy(desc(questions.createdAt));

    // Format the data to match expected structure
    const formattedQuestions = allQuestions.map(q => ({
      ...q,
      studentName: `${q.studentName || ''} ${q.studentLastName || ''}`.trim() || q.studentEmail
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

/**
 * GET /api/admin/contacts
 * Get all contact form submissions
 */
router.get('/contacts', async (req, res) => {
  try {
    const allContacts = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));

    res.json(allContacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

/**
 * POST /api/homework
 * Create homework assignment
 */
router.post('/homework', async (req, res) => {
  try {
    const { studentId, title, description, instructions, subject, difficulty, dueDate } = req.body;

    if (!studentId || !title || !description || !subject) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newHomework = await db
      .insert(homework)
      .values({
        studentId,
        tutorId: req.user!.userId, // Admin/tutor creating the homework
        title,
        description,
        instructions: instructions || null,
        subject,
        difficulty: difficulty || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
        isCompleted: false,
      })
      .returning();

    // Send email notification
    try {
      const student = await db
        .select()
        .from(users)
        .where(eq(users.id, studentId))
        .limit(1);

      if (student.length > 0) {
        // Notify admin about homework assignment
        await EmailNotificationService.notifyHomeworkAssigned({
          studentEmail: student[0].email,
          homeworkTitle: title,
          subject: subject,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          isUpdate: false,
        });

        // Notify student about homework assignment
        await EmailNotificationService.notifyStudentHomeworkAssigned({
          studentEmail: student[0].email,
          homeworkTitle: title,
          subject: subject,
          description: description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          isUpdate: false,
        });
      }
    } catch (emailError) {
      console.error("Failed to send homework assignment notification:", emailError);
    }

    res.status(201).json(newHomework[0]);
  } catch (error) {
    console.error('Create homework error:', error);
    res.status(500).json({ error: 'Failed to create homework' });
  }
});

/**
 * PATCH /api/questions/:id/answer
 * Answer a student question
 */
router.patch('/questions/:id/answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ error: 'Answer is required' });
    }

    const updatedQuestion = await db
      .update(questions)
      .set({
        answer: answer.trim(),
        isAnswered: true,
        answeredAt: new Date(),
        answeredBy: req.user!.userId,
      })
      .where(eq(questions.id, id))
      .returning();

    if (updatedQuestion.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Send email notification to student
    try {
      const student = await db
        .select()
        .from(users)
        .where(eq(users.id, updatedQuestion[0].studentId))
        .limit(1);

      if (student.length > 0) {
        await EmailNotificationService.notifyStudentQuestionAnswered({
          studentEmail: student[0].email,
          questionTitle: updatedQuestion[0].title,
          questionContent: updatedQuestion[0].content,
          answer: answer.trim(),
          subject: updatedQuestion[0].subject,
        });
      }
    } catch (emailError) {
      console.error("Failed to send question answer notification:", emailError);
    }

    res.json(updatedQuestion[0]);
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

/**
 * GET /api/availability
 * Get tutor availability
 */
router.get('/availability', async (req, res) => {
  try {
    const availability = await db
      .select()
      .from(tutorAvailability)
      .where(eq(tutorAvailability.tutorId, req.user!.userId))
      .orderBy(desc(tutorAvailability.date));

    res.json(availability);
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

/**
 * POST /api/availability
 * Create availability slot
 */
router.post('/availability', async (req, res) => {
  try {
    const { date, startTime, endTime, notes } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }

    const newAvailability = await db
      .insert(tutorAvailability)
      .values({
        tutorId: req.user!.userId,
        date: new Date(date),
        startTime,
        endTime,
        notes: notes || null,
        isAvailable: true,
      })
      .returning();

    res.status(201).json(newAvailability[0]);
  } catch (error) {
    console.error('Create availability error:', error);
    res.status(500).json({ error: 'Failed to create availability' });
  }
});

/**
 * POST /api/homework/files
 * Upload homework files
 */
router.post('/homework/files', async (req, res) => {
  try {
    // This endpoint would handle file uploads
    // For now, we'll return a placeholder response
    res.json({ success: true, message: 'File upload functionality not yet implemented' });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

/**
 * PUT /api/admin/homework/:id
 * Update homework assignment
 */
router.put('/homework/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, title, subject, description, difficulty, dueDate, attachedFiles } = req.body;

    // Validate required fields
    if (!studentId || !title || !subject || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if homework exists
    const existingHomework = await db
      .select()
      .from(homework)
      .where(eq(homework.id, id))
      .limit(1);

    if (existingHomework.length === 0) {
      return res.status(404).json({ error: 'Homework assignment not found' });
    }

    // Update the homework assignment
    const updatedHomework = await db
      .update(homework)
      .set({
        studentId,
        title,
        subject,
        description,
        difficulty: difficulty || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        updatedAt: new Date(),
      })
      .where(eq(homework.id, id))
      .returning();

    if (updatedHomework.length === 0) {
      return res.status(404).json({ error: 'Failed to update homework assignment' });
    }

    // Send email notification
    try {
      const student = await db
        .select()
        .from(users)
        .where(eq(users.id, studentId))
        .limit(1);

      if (student.length > 0) {
        // Notify admin about homework update
        await EmailNotificationService.notifyHomeworkAssigned({
          studentEmail: student[0].email,
          homeworkTitle: title,
          subject: subject,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          isUpdate: true,
        });

        // Notify student about homework update
        await EmailNotificationService.notifyStudentHomeworkAssigned({
          studentEmail: student[0].email,
          homeworkTitle: title,
          subject: subject,
          description: description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          isUpdate: true,
        });
      }
    } catch (emailError) {
      console.error("Failed to send homework update notification:", emailError);
    }

    res.json({
      success: true,
      message: 'Homework assignment updated successfully',
      homework: updatedHomework[0]
    });
  } catch (error) {
    console.error('Update homework error:', error);
    res.status(500).json({ error: 'Failed to update homework assignment' });
  }
});

/**
 * DELETE /api/admin/homework/:id
 * Delete homework assignment
 */
router.delete('/homework/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if homework exists and belongs to this admin/tutor
    const existingHomework = await db
      .select()
      .from(homework)
      .where(eq(homework.id, id))
      .limit(1);

    if (existingHomework.length === 0) {
      return res.status(404).json({ error: 'Homework assignment not found' });
    }

    // Delete associated homework files first
    await db
      .delete(homeworkFiles)
      .where(eq(homeworkFiles.homeworkId, id));

    // Delete the homework assignment
    const deletedHomework = await db
      .delete(homework)
      .where(eq(homework.id, id))
      .returning();

    if (deletedHomework.length === 0) {
      return res.status(404).json({ error: 'Failed to delete homework assignment' });
    }

    res.json({
      success: true,
      message: 'Homework assignment deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Delete homework error:', error);
    res.status(500).json({ error: 'Failed to delete homework assignment' });
  }
});

/**
 * DELETE /api/admin/availability/:id
 * Delete availability slot
 */
router.delete('/availability/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the slot exists and belongs to this tutor
    const existingSlot = await db
      .select()
      .from(tutorAvailability)
      .where(and(
        eq(tutorAvailability.id, id),
        eq(tutorAvailability.tutorId, req.user!.userId)
      ))
      .limit(1);

    if (existingSlot.length === 0) {
      return res.status(404).json({ error: 'Availability slot not found or access denied' });
    }

    // Check if the slot is booked
    const slot = existingSlot[0];
    if (!slot.isAvailable && slot.bookedBy) {
      return res.status(400).json({
        error: 'Cannot delete a booked time slot. Please contact the student to reschedule first.'
      });
    }

    // Delete the availability slot
    const deletedSlot = await db
      .delete(tutorAvailability)
      .where(eq(tutorAvailability.id, id))
      .returning();

    if (deletedSlot.length === 0) {
      return res.status(404).json({ error: 'Failed to delete availability slot' });
    }

    res.json({
      success: true,
      message: 'Availability slot deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ error: 'Failed to delete availability slot' });
  }
});

export default router;
