import "reflect-metadata";
import { beforeEach } from "vitest";
import { Container } from "../src/container/container.js";

// Reset container before each test to avoid pollution
beforeEach(() => {
  Container.getGlobal().clear();
});
