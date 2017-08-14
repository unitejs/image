/**
 * Tests for ICNS.
 */
import * as Chai from "chai";
import { ICNS } from "../../../dist/icns";

describe("ICNS", () => {
    it("can be created", () => {
        const obj = new ICNS();
        Chai.should().exist(obj);
    });
});
