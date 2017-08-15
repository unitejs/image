/**
 * Tests for ICNS.
 */
import * as Chai from "chai";
import * as Sinon from "sinon";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
import { DefaultLogger } from "unitejs-framework/dist/loggers/defaultLogger";
import { ICNS } from "../../../dist/icns";
import { FileSystemMock } from "./fileSystem.mock";

describe("ICNS", () => {
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
        const obj = new ICNS();
        Chai.should().exist(obj);
    });

    describe("fromPng", () => {
        it("can return error with no logger", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(defaultLoggerStub.args[0][0]).to.contain("logger");
        });

        it("can return error with no file system", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("file system");
        });

        it("can return error with no sourceFolder", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, fileSystemStub, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFolder");
        });

        it("can return error with no sourceFile", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFile");
        });

        it("can return error with no destFolder", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.png", undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("destFolder");
        });

        it("can return error with no destFile", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", "test.png", "./test/unit/temp", undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("destFile");
        });

        it("can file when source file does not exist", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", "blah.png", "./test/unit/temp", "test.icns");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("does not exist");
        });

        it("can return error when the source png is zero length", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", "zero.png", "./test/unit/temp", "test.icns");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("zero length");
        });

        it("can return error when the source png is invalid", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", "invalid.png", "./test/unit/temp", "test.icns");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("reading source image");
        });

        it("can create icns file with missing dest directory", async () => {
            const obj = new ICNS();
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", "test1024.png", "./test/unit/temp", "test.icns");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "test.icns");
            Chai.expect(exists).to.be.equal(true);
        });

        it("can create icns file with existing dest directory", async () => {
            const obj = new ICNS();
            await fileSystemStub.directoryCreate("./test/unit/temp");
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", "test1024.png", "./test/unit/temp", "test.icns");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "test.icns");
            Chai.expect(exists).to.be.equal(true);
        });

        it("can throw error if conversion fails", async () => {
            const obj = new ICNS();
            const stub = sandbox.stub(fileSystemStub, "fileReadBinary");
            stub.throws("kaboom");
            const res = await obj.fromPng(loggerStub, fileSystemStub, "./test/unit/assets", "test1024.png", "./test/unit/temp", "test.icns");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("failed");
        });
    });
});
