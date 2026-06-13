import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

const NUTRI_A = "nutritionistA";
const NUTRI_B = "nutritionistB";
const PATIENT_UID = "patientUserA";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-storm",
    firestore: {
      rules: readFileSync(resolve(__dirname, "../firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  // Seed data bypassing the rules (admin context).
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, `patientProfiles/${PATIENT_UID}`), {
      nutritionistId: NUTRI_A,
      patientId: "p1",
      role: "patient",
    });
    await setDoc(doc(db, `users/${NUTRI_A}/patients/p1`), {
      firstName: "Ana",
      clinicalTags: [],
      weight: 60,
    });
    await setDoc(doc(db, `users/${NUTRI_A}/diets/d1`), { patientId: "p1" });
    await setDoc(doc(db, `users/${NUTRI_A}/diets/d2`), { patientId: "p2" });
    await setDoc(doc(db, `users/${NUTRI_B}/patients/pb`), { firstName: "Bob" });
  });
});

describe("Firestore security rules", () => {
  it("denies all access to unauthenticated users", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, `users/${NUTRI_A}/patients/p1`)));
    await assertFails(
      setDoc(doc(db, `users/${NUTRI_A}/patients/x`), { firstName: "X" }),
    );
  });

  it("lets a nutritionist read and write their own patients", async () => {
    const db = testEnv.authenticatedContext(NUTRI_A).firestore();
    await assertSucceeds(getDoc(doc(db, `users/${NUTRI_A}/patients/p1`)));
    await assertSucceeds(
      setDoc(doc(db, `users/${NUTRI_A}/patients/p2`), { firstName: "Carlos" }),
    );
  });

  it("FORBIDS a nutritionist from reading or writing another's patients (isolation)", async () => {
    const dbA = testEnv.authenticatedContext(NUTRI_A).firestore();
    await assertFails(getDoc(doc(dbA, `users/${NUTRI_B}/patients/pb`)));
    await assertFails(
      setDoc(doc(dbA, `users/${NUTRI_B}/patients/hack`), { firstName: "X" }),
    );
  });

  it("lets an associated patient read their own diet but not another patient's", async () => {
    const db = testEnv.authenticatedContext(PATIENT_UID).firestore();
    await assertSucceeds(getDoc(doc(db, `users/${NUTRI_A}/diets/d1`)));
    await assertFails(getDoc(doc(db, `users/${NUTRI_A}/diets/d2`)));
  });

  it("lets a patient update only self-service fields, not clinical data", async () => {
    const db = testEnv.authenticatedContext(PATIENT_UID).firestore();
    // Allowed: self-reported weight
    await assertSucceeds(
      updateDoc(doc(db, `users/${NUTRI_A}/patients/p1`), { weight: 62 }),
    );
    // Forbidden: tampering with clinical fields owned by the nutritionist
    await assertFails(
      updateDoc(doc(db, `users/${NUTRI_A}/patients/p1`), {
        clinicalTags: ["diabetes_t2"],
      }),
    );
  });

  it("protects patientProfiles from unrelated nutritionists", async () => {
    const dbB = testEnv.authenticatedContext(NUTRI_B).firestore();
    await assertFails(getDoc(doc(dbB, `patientProfiles/${PATIENT_UID}`)));
  });
});
