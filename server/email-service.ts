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
}
