/**
 * Tests for SVG.
 */
import * as Chai from "chai";
import { SVG } from "../../../dist/svg";

describe("SVG", () => {
    it("can be created", () => {
        const obj = new SVG();
        Chai.should().exist(obj);
    });
});
