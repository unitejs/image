import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
export declare class ICNS {
    fromPng(logger: ILogger, fileSystem: IFileSystem, sourceFolder: string | undefined | null, sourceFile: string | undefined | null, destFolder: string | undefined | null, destFile: string): Promise<number>;
    private imageToIcns;
    private appendChunk;
}
