/**
 * Tests for SVG.
 */
import * as Chai from "chai";
import * as Sinon from "sinon";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
import { DefaultLogger } from "unitejs-framework/dist/loggers/defaultLogger";
import { SVG } from "../../../src/svg";
import { FileSystemMock } from "./fileSystem.mock";

describe("SVG", () => {
    let sandbox: Sinon.SinonSandbox;
    let loggerStub: ILogger;
    let fileSystemStub: IFileSystem;
    let defaultLoggerStub: Sinon.SinonStub;
    let loggerErrorSpy: Sinon.SinonSpy;

    beforeEach(() => {
        sandbox = Sinon.sandbox.create();
        loggerStub = <ILogger>{};
        loggerStub.banner = () => { };
        loggerStub.info = () => { };
        loggerStub.warning = () => { };
        loggerStub.error = () => { };

        fileSystemStub = new FileSystemMock();

        loggerErrorSpy = sandbox.spy(loggerStub, "error");

        defaultLoggerStub = sandbox.stub(DefaultLogger, "log");
    });

    afterEach(async () => {
        sandbox.restore();
        await fileSystemStub.directoryDelete("./test/unit/temp");
    });

    it("can be created", () => {
        const obj = new SVG();
        Chai.should().exist(obj);
    });

    describe("toPng", () => {
        it("can return error with no logger", async () => {
            const obj = new SVG();
            const res = await obj.toPng(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(defaultLoggerStub.args[0][0]).to.contain("logger");
        });

        it("can return error with no file system", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("file system");
        });

        it("can return error with no sourceFolder", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFolder");
        });

        it("can return error with no sourceFile", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFile");
        });

        it("can return error with no destFolder", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", undefined, undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("destFolder");
        });

        it("can return error with no destFile", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("destFile");
        });

        it("can return error with no width", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("width");
        });

        it("can return error with zero width", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", 0, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("width");
        });

        it("can return error with no height", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", 100, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("height");
        });

        it("can return error with zero height", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", 100, 0, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("height");
        });

        it("can return error with invalid background", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", 100, 100, undefined, undefined, "#A");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("background");
        });

        it("can return error if source file does not exist", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "missing.svg", "./test/unit/temp", "test.png", 100, 100, 10, 10, "#AAA");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("does not exist");
        });

        it("can succeed if source file exists with no background", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", 100, 100, 10, 10, undefined);
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "test.png");
            Chai.expect(exists).to.be.equal(true);
        });

        it("can succeed if source file exists with background", async () => {
            const obj = new SVG();
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", 100, 100, 10, 10, "#F00");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "test.png");
            Chai.expect(exists).to.be.equal(true);
        });

        it("can succeed if dest directory exists", async () => {
            const obj = new SVG();
            await fileSystemStub.directoryCreate("./test/unit/temp");
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", 100, 100, 10, 10, "#F00");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "test.png");
            Chai.expect(exists).to.be.equal(true);
        });

        it("can throw error if conversion fails", async () => {
            const obj = new SVG();
            const stub = sandbox.stub(fileSystemStub, "fileExists");
            stub.throws("kaboom");
            const res = await obj.toPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "test.png", 100, 100, 10, 10, "#F00");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("failed");
        });
    });

    describe("toMask", () => {
        it("can return error with no logger", async () => {
            const obj = new SVG();
            const res = await obj.toMask(undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(defaultLoggerStub.args[0][0]).to.contain("logger");
        });

        it("can return error with no file system", async () => {
            const obj = new SVG();
            const res = await obj.toMask(loggerStub, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("file system");
        });

        it("can return error with no sourceFolder", async () => {
            const obj = new SVG();
            const res = await obj.toMask(loggerStub, fileSystemStub, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFolder");
        });

        it("can return error with no sourceFile", async () => {
            const obj = new SVG();
            const res = await obj.toMask(loggerStub, fileSystemStub, "./test/unit/assets", undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFile");
        });

        it("can return error with no destFolder", async () => {
            const obj = new SVG();
            const res = await obj.toMask(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("destFolder");
        });

        it("can return error with no destFile", async () => {
            const obj = new SVG();
            const res = await obj.toMask(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("destFile");
        });

        it("can return error if source file does not exist", async () => {
            const obj = new SVG();
            const res = await obj.toMask(loggerStub, fileSystemStub, "./test/unit/assets", "missing.svg", "./test/unit/temp", "mask.svg");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("does not exist");
        });

        it("can succeed if source file exists", async () => {
            const obj = new SVG();
            const res = await obj.toMask(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "mask.svg");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "mask.svg");
            Chai.expect(exists).to.be.equal(true);
            if (exists) {
                const content = await fileSystemStub.fileReadText("./test/unit/temp", "mask.svg");
                Chai.expect(content).not.to.contain("fill=\"rgb(255,255,255)\"");
            }
        });

        it("can succeed if dest directory exists", async () => {
            const obj = new SVG();
            await fileSystemStub.directoryCreate("./test/unit/temp");
            const res = await obj.toMask(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "mask.svg");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "mask.svg");
            Chai.expect(exists).to.be.equal(true);
            if (exists) {
                const content = await fileSystemStub.fileReadText("./test/unit/temp", "mask.svg");
                Chai.expect(content).not.to.contain("fill=\"rgb(255,255,255)\"");
            }
        });

        it("can throw error if conversion fails", async () => {
            const obj = new SVG();
            const stub = sandbox.stub(fileSystemStub, "fileExists");
            stub.throws("kaboom");
            const res = await obj.toMask(loggerStub, fileSystemStub, "./test/unit/assets", "test.svg", "./test/unit/temp", "mask.svg");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("failed");
        });
    });
});
