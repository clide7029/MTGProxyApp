declare namespace NodeJS {
  interface Global {
    createTestUser: () => Promise<any>; // Will be properly typed once User model is implemented
    createTestDeck: () => Promise<any>; // Will be properly typed once Deck model is implemented
    generateAuthToken: () => string;
  }
}

declare namespace jest {
  interface Matchers<R> {
    toBeValidMongoId(): R;
  }
}