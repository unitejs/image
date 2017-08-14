/**
 * Tests for ICO.
 */
import * as Chai from "chai";
import { ICO } from "../../../dist/ico";

describe("ICO", () => {
    it("can be created", () => {
        const obj = new ICO();
        Chai.should().exist(obj);
    });
});
