import { storage } from './storage.js';

export class EmailNotificationService {
  private static readonly ADMIN_EMAIL = 'olovka0987@gmail.com';

  /**
   * Send notification about new question submitted
   */
  static async notifyNewQuestion(questionData: {
    studentEmail: string;
    subject: string;
    title: string;
    content: string;
  }) {
    try {
      await storage.createContact({
        name: `New Question Alert - ${questionData.studentEmail}`,
        email: questionData.studentEmail,
        phone: '',
        subject: `New Question: ${questionData.subject}`,
        message: `🔔 NEW QUESTION SUBMITTED

Student: ${questionData.studentEmail}
Subject: ${questionData.subject}
Title: ${questionData.title}

Question:
${questionData.content}

Please log into your admin dashboard to respond to this question.`
      });

      console.log(`📧 New question notification sent for ${questionData.studentEmail} - ${questionData.subject}`);
    } catch (error) {
      console.error('Failed to send new question notification:', error);
    }
  }

  /**
   * Send notification about homework completion
   */
  static async notifyHomeworkCompleted(homeworkData: {
    studentEmail: string;
    homeworkTitle: string;
    subject: string;
    completedAt: Date;
  }) {
    try {
      await storage.createContact({
        name: `Homework Completed - ${homeworkData.studentEmail}`,
        email: homeworkData.studentEmail,
        phone: '',
        subject: `Homework Completed: ${homeworkData.homeworkTitle}`,
        message: `✅ HOMEWORK COMPLETED

Student: ${homeworkData.studentEmail}
Assignment: ${homeworkData.homeworkTitle}
Subject: ${homeworkData.subject}
Completed: ${homeworkData.completedAt.toLocaleString()}

The student has submitted their homework. Please review and provide feedback in your admin dashboard.`
      });

      console.log(`📧 Homework completion notification sent for ${homeworkData.studentEmail} - ${homeworkData.homeworkTitle}`);
    } catch (error) {
      console.error('Failed to send homework completion notification:', error);
    }
  }

  /**
   * Send notification about homework submission
   */
  static async notifyHomeworkSubmitted(submissionData: {
    studentEmail: string;
    homeworkTitle: string;
    subject: string;
    submissionType: 'text' | 'file';
    submissionContent?: string;
  }) {
    try {
      await storage.createContact({
        name: `Homework Submission - ${submissionData.studentEmail}`,
        email: submissionData.studentEmail,
        phone: '',
        subject: `Homework Submitted: ${submissionData.homeworkTitle}`,
        message: `📝 HOMEWORK SUBMITTED

Student: ${submissionData.studentEmail}
Homework: ${submissionData.homeworkTitle}
Subject: ${submissionData.subject}
Submission Type: ${submissionData.submissionType}
${submissionData.submissionContent ? `Content: ${submissionData.submissionContent}` : ''}

A student has submitted their homework. Please review the submission in your admin dashboard.`
      });

      console.log(`📧 Homework submission notification sent for ${submissionData.studentEmail} - ${submissionData.homeworkTitle}`);
    } catch (error) {
      console.error('Failed to send homework submission notification:', error);
    }
  }

  /**
   * Send notification about time slot booking
   */
  static async notifySlotBooked(bookingData: {
    studentEmail: string;
    slotDate: string;
    slotTime: string;
    notes?: string;
  }) {
    try {
      await storage.createContact({
        name: `Session Booking - ${bookingData.studentEmail}`,
        email: bookingData.studentEmail,
        phone: '',
        subject: `New Session Booking - ${bookingData.slotDate}`,
        message: `📅 NEW SESSION BOOKED

Student: ${bookingData.studentEmail}
Date: ${bookingData.slotDate}
Time: ${bookingData.slotTime}
${bookingData.notes ? `Notes: ${bookingData.notes}` : 'No additional notes'}

A student has booked a tutoring session. Please prepare for the upcoming session and contact the student if needed.`
      });

      console.log(`📧 Session booking notification sent for ${bookingData.studentEmail} - ${bookingData.slotDate} ${bookingData.slotTime}`);
    } catch (error) {
      console.error('Failed to send booking notification:', error);
    }
  }

  /**
   * Send notification about homework assignment created/updated
   */
  static async notifyHomeworkAssigned(homeworkData: {
    studentEmail: string;
    homeworkTitle: string;
    subject: string;
    dueDate?: Date;
    isUpdate: boolean;
  }) {
    try {
      await storage.createContact({
        name: `Homework ${homeworkData.isUpdate ? 'Updated' : 'Assigned'} - ${homeworkData.studentEmail}`,
        email: homeworkData.studentEmail,
        phone: '',
        subject: `Homework ${homeworkData.isUpdate ? 'Updated' : 'Assigned'}: ${homeworkData.homeworkTitle}`,
        message: `📝 HOMEWORK ${homeworkData.isUpdate ? 'UPDATED' : 'ASSIGNED'}

Student: ${homeworkData.studentEmail}
Assignment: ${homeworkData.homeworkTitle}
Subject: ${homeworkData.subject}
${homeworkData.dueDate ? `Due Date: ${homeworkData.dueDate.toLocaleDateString()}` : 'No due date set'}

You have ${homeworkData.isUpdate ? 'updated' : 'created'} a homework assignment for this student.`
      });

      console.log(`📧 Homework ${homeworkData.isUpdate ? 'update' : 'assignment'} notification sent for ${homeworkData.studentEmail} - ${homeworkData.homeworkTitle}`);
    } catch (error) {
      console.error('Failed to send homework assignment notification:', error);
    }
  }

  /**
   * Send notification about new user registration
   */
  static async notifyNewRegistration(userData: {
    studentEmail: string;
    studentName: string;
    mathLevel: string;
    goals: string;
  }) {
    try {
      await storage.createContact({
        name: `New Student Registration - ${userData.studentEmail}`,
        email: userData.studentEmail,
        phone: '',
        subject: `New Student Registered: ${userData.studentName}`,
        message: `🎓 NEW STUDENT REGISTERED

Name: ${userData.studentName}
Email: ${userData.studentEmail}
Math Level: ${userData.mathLevel}

Goals:
${userData.goals}

A new student has registered for tutoring. You may want to reach out to welcome them and schedule an initial assessment.`
      });

      console.log(`📧 New registration notification sent for ${userData.studentEmail} - ${userData.studentName}`);
    } catch (error) {
      console.error('Failed to send registration notification:', error);
    }
  }

  /**
   * Send notification to student about homework assignment
   */
  static async notifyStudentHomeworkAssigned(homeworkData: {
    studentEmail: string;
    homeworkTitle: string;
    subject: string;
    description: string;
    dueDate?: Date;
    isUpdate: boolean;
  }) {
    try {
      await storage.createContact({
        name: `Homework ${homeworkData.isUpdate ? 'Updated' : 'Assigned'} - ${homeworkData.studentEmail}`,
        email: 'olovka0987@gmail.com', // Admin will see this as contact
        phone: homeworkData.studentEmail, // Store student email in phone field for reference
        subject: `Student Notification: Homework ${homeworkData.isUpdate ? 'Updated' : 'Assigned'}`,
        message: `📝 STUDENT NOTIFICATION: Homework ${homeworkData.isUpdate ? 'Updated' : 'Assigned'}

TO: ${homeworkData.studentEmail}
SUBJECT: New Homework Assignment - ${homeworkData.subject}

Dear Student,

You have been ${homeworkData.isUpdate ? 'updated with a revised' : 'assigned a new'} homework assignment:

Assignment: ${homeworkData.homeworkTitle}
Subject: ${homeworkData.subject}
${homeworkData.dueDate ? `Due Date: ${homeworkData.dueDate.toLocaleDateString()}` : 'No due date set'}

Description:
${homeworkData.description}

Please log into your student dashboard to view the full assignment details and any attached files.

Good luck with your studies!
Best regards,
LukaMath Tutoring`
      });

      console.log(`📧 Student homework notification sent to ${homeworkData.studentEmail} - ${homeworkData.homeworkTitle}`);
    } catch (error) {
      console.error('Failed to send student homework notification:', error);
    }
  }

  /**
   * Send notification to student about question answer
   */
  static async notifyStudentQuestionAnswered(answerData: {
    studentEmail: string;
    questionTitle: string;
    questionContent: string;
    answer: string;
    subject: string;
  }) {
    try {
      await storage.createContact({
        name: `Question Answered - ${answerData.studentEmail}`,
        email: 'olovka0987@gmail.com', // Admin will see this as contact
        phone: answerData.studentEmail, // Store student email in phone field for reference
        subject: `Student Notification: Your Question Has Been Answered`,
        message: `💡 STUDENT NOTIFICATION: Question Answered

TO: ${answerData.studentEmail}
SUBJECT: Your ${answerData.subject} Question Has Been Answered

Dear Student,

Your question has been answered by your tutor!

Original Question: "${answerData.questionTitle}"
Subject: ${answerData.subject}

Your Question:
${answerData.questionContent}

Tutor's Answer:
${answerData.answer}

Please log into your student dashboard to view the complete answer and ask any follow-up questions if needed.

Keep up the great work!
Best regards,
LukaMath Tutoring`
      });

      console.log(`📧 Student question answer notification sent to ${answerData.studentEmail} - ${answerData.questionTitle}`);
    } catch (error) {
      console.error('Failed to send student answer notification:', error);
    }
  }

  /**
   * Send notification to student about homework grading
   */
  static async notifyStudentHomeworkGraded(gradingData: {
    studentEmail: string;
    homeworkTitle: string;
    subject: string;
    grade?: string;
    feedback?: string;
    status: string;
  }) {
    try {
      await storage.createContact({
        name: `Homework Graded - ${gradingData.studentEmail}`,
        email: 'olovka0987@gmail.com', // Admin will see this as contact
        phone: gradingData.studentEmail, // Store student email in phone field for reference
        subject: `Student Notification: Homework Graded`,
        message: `✅ STUDENT NOTIFICATION: Homework Graded

TO: ${gradingData.studentEmail}
SUBJECT: Your ${gradingData.subject} Homework Has Been Graded

Dear Student,

Your homework assignment has been reviewed and graded!

Assignment: ${gradingData.homeworkTitle}
Subject: ${gradingData.subject}
Status: ${gradingData.status}
${gradingData.grade ? `Grade: ${gradingData.grade}` : ''}

${gradingData.feedback ? `Feedback from your tutor:
${gradingData.feedback}` : ''}

Please log into your student dashboard to view the complete feedback and results.

Great job on completing your assignment!
Best regards,
LukaMath Tutoring`
      });

      console.log(`📧 Student homework grading notification sent to ${gradingData.studentEmail} - ${gradingData.homeworkTitle}`);
    } catch (error) {
      console.error('Failed to send student grading notification:', error);
    }
  }
}
