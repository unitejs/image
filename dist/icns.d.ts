import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
export declare class ICNS {
    fromPng(logger: ILogger, fileSystem: IFileSystem, sourceFolder: string, sourceFile: string, destFolder: string, destFile: string): Promise<number>;
    private imageToIcns(logger, sourceImage);
    private appendChunk(sourceImage, outBuffer, type, size);
}
