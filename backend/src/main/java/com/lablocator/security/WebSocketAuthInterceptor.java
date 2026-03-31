package com.lablocator.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Reads the JWT from the STOMP CONNECT frame's "Authorization" header
 * and sets the authenticated principal on the STOMP session.
 *
 * This is required so that Spring's SimpleMessageBroker can route
 * convertAndSendToUser() messages to the right session.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String email = jwtService.extractUsername(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (jwtService.isTokenValid(token, userDetails)) {
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                        // Set the principal on the STOMP session —
                        // its getName() returns the email, which is what
                        // convertAndSendToUser() must use as the target name.
                        accessor.setUser(auth);
                        log.debug("WebSocket CONNECT authenticated: {}", email);
                    }
                } catch (Exception ex) {
                    log.warn("WebSocket CONNECT: invalid JWT — {}", ex.getMessage());
                    // Allow connection but without a principal (will get no user-specific messages)
                }
            }
        }

        return message;
    }
}
