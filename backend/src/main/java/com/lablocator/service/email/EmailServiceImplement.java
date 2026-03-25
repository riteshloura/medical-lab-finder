package com.lablocator.service.email;

import com.lablocator.exceptions.EmailSendException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImplement implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailServiceImplement.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendSimpleMail(String to, String subject, String body) throws EmailSendException {
        try {
          SimpleMailMessage message = new SimpleMailMessage();
          message.setFrom("LabLocator <" + fromEmail + ">");
          message.setTo(to);
          message.setSubject(subject);
          message.setText(body);

          mailSender.send(message);
        } catch (MailException ex) {
          log.error("Failed to send simple email to {} with subject {}", to, subject, ex);
          throw new EmailSendException("Failed to send email to " + to, ex);
        }
    }

    @Override
    public void sendHtmlMail(String to, String subject, String htmlContent, String name) throws EmailSendException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(name + " via LabLocator <" + fromEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MailException | MessagingException ex) {
            log.error("Failed to send HTML email to {} with subject {}", to, subject, ex);
            throw new EmailSendException("Failed to send email to " + to, ex);
        }
    }
}
