import { IFileSystem } from "unitejs-framework/dist/interfaces/IFileSystem";
import { ILogger } from "unitejs-framework/dist/interfaces/ILogger";
export declare class ICO {
    fromPngs(logger: ILogger, fileSystem: IFileSystem, sourceFolder: string | undefined | null, sourceFiles: string[] | undefined | null, destFolder: string | undefined | null, destFile: string | undefined | null): Promise<number>;
    private imagesToIco(images);
    private getHeader(numOfImages);
    private getDir(img, offset);
    private getBmpInfoHeader(img);
    private getDib(img);
}
