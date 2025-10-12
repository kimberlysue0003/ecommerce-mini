package com.ecommerce.mini.entity.generator;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;
import java.security.SecureRandom;

/**
 * Custom ID generator that creates random alphanumeric IDs
 * Matches the cuid format used in the Node.js/Prisma backend
 */
public class CustomIdGenerator implements IdentifierGenerator {

    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int ID_LENGTH = 25;

    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) {
        StringBuilder id = new StringBuilder(ID_LENGTH);

        // Generate random alphanumeric string
        for (int i = 0; i < ID_LENGTH; i++) {
            int index = RANDOM.nextInt(CHARACTERS.length());
            id.append(CHARACTERS.charAt(index));
        }

        return id.toString();
    }
}
