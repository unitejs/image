import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
export declare class ICO {
    fromPngs(logger: ILogger, fileSystem: IFileSystem, sourceFolder: string, sourceFiles: string[], destFolder: string, destFile: string): Promise<number>;
    private imagesToIco(images);
    private getHeader(numOfImages);
    private getDir(img, offset);
    private getBmpInfoHeader(img, compressionMode);
    private getDib(img);
}
