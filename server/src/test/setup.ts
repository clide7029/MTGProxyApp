import { jest, beforeAll, beforeEach, afterAll, expect } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
  var createTestUser: () => Promise<any>;
  var createTestDeck: () => Promise<any>;
  var generateAuthToken: () => string;
}

let mongo: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Set test environment variables
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';

  // Create and start MongoDB Memory Server with default version
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

// Clear all collections after each test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (mongo) {
    await mongoose.disconnect();
    await mongo.stop();
  }
});

// Global test helpers
global.createTestUser = async () => {
  // TODO: Implement user creation helper
  return null;
};

global.createTestDeck = async () => {
  // TODO: Implement deck creation helper
  return null;
};

global.generateAuthToken = () => {
  // TODO: Implement JWT token generation helper
  return 'test-token';
};

// Add custom matchers
expect.extend({
  toBeValidMongoId(received: string) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    return {
      pass,
      message: () =>
        `expected ${received} to ${pass ? 'not ' : ''}be a valid MongoDB ObjectId`,
    };
  },
});