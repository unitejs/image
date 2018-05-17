/**
 * Tests for ICO.
 */
import * as Chai from "chai";
import * as Sinon from "sinon";
import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
import { DefaultLogger } from "unitejs-framework/dist/loggers/defaultLogger";
import { ICO } from "../../../src/ico";
import { FileSystemMock } from "./fileSystem.mock";

describe("ICO", () => {
    let sandbox: Sinon.SinonSandbox;
    let loggerStub: ILogger;
    let fileSystemStub: IFileSystem;
    let defaultLoggerStub: Sinon.SinonStub;
    let loggerErrorSpy: Sinon.SinonSpy;

    beforeEach(() => {
        sandbox = Sinon.createSandbox();
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
        const obj = new ICO();
        Chai.should().exist(obj);
    });

    describe("fromPngs", () => {
        it("can return error with no logger", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(undefined, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(defaultLoggerStub.args[0][0]).to.contain("logger");
        });

        it("can return error with no file system", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, undefined, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("file system");
        });

        it("can return error with no sourceFolder", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, fileSystemStub, undefined, undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFolder");
        });

        it("can return error with no sourceFiles supplied", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", undefined, undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFiles");
        });

        it("can return error with no sourceFiles", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", [], undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("sourceFiles");
        });

        it("can return error with no destFolder", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", ["favicon-16x16.png", "favicon-32x32.png"], undefined, undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("destFolder");
        });

        it("can return error with no destFile", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", ["favicon-16x16.png", "favicon-32x32.png"], "./test/unit/temp", undefined);
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("destFile");
        });

        it("can return error when source file does not exist", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", ["favicon-1x1.png"], "./test/unit/temp", "test.ico");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("does not exist");
        });

        it("can return error when source file is zero length", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", ["favicon-0x0.png"], "./test/unit/temp", "test.ico");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("is zero length");
        });

        it("can succeed when dest directory does not exist", async () => {
            const obj = new ICO();
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", ["favicon-16x16.png", "favicon-32x32.png"], "./test/unit/temp", "test.ico");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "test.ico");
            Chai.expect(exists).to.be.equal(true);
        });

        it("can succeed when dest directory does exist", async () => {
            const obj = new ICO();
            await fileSystemStub.directoryCreate("./test/unit/temp");
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", ["favicon-16x16.png", "favicon-32x32.png"], "./test/unit/temp", "test.ico");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "test.ico");
            Chai.expect(exists).to.be.equal(true);
        });

        it("can succeed with large image", async () => {
            const obj = new ICO();
            await fileSystemStub.directoryCreate("./test/unit/temp");
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", ["test1024.png", "favicon-32x32.png"], "./test/unit/temp", "test.ico");
            Chai.expect(res).to.be.equal(0);
            const exists = await fileSystemStub.fileExists("./test/unit/temp", "test.ico");
            Chai.expect(exists).to.be.equal(true);
        });

        it("can throw error if conversion fails", async () => {
            const obj = new ICO();
            const stub = sandbox.stub(fileSystemStub, "fileReadBinary");
            stub.throws("kaboom");
            const res = await obj.fromPngs(loggerStub, fileSystemStub, "./test/unit/assets", ["favicon-16x16.png", "favicon-32x32.png"], "./test/unit/temp", "test.ico");
            Chai.expect(res).to.be.equal(1);
            Chai.expect(loggerErrorSpy.args[0][0]).to.contain("failed");
        });
    });
});
