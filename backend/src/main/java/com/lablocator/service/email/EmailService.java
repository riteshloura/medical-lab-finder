package com.lablocator.service.email;

import com.lablocator.exceptions.EmailSendException;

public interface EmailService {
    void sendSimpleMail(String to, String subject, String body) throws EmailSendException;
    void sendHtmlMail(String to, String subject, String htmlContent, String name) throws EmailSendException;
}
