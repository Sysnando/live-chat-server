import {ENV, Environment} from "../environment";
import {IORoom} from "./io-room";
import chromium from 'chrome-aws-lambda';
import {Browser} from "puppeteer-core/lib/cjs/puppeteer/common/Browser";
import puppeteer from "puppeteer-core/lib/cjs/puppeteer/node-puppeteer-core";
import {Page} from "puppeteer-core/lib/cjs/puppeteer/common/Page";
import {PageVideoCapture} from "../puppeteer-video/PageVideoCapture";

const PUPPETEER_ARGS = ['--incognito', '--proxy-bypass-list=*', '--proxy-server="direct://"'];
const PUPPETEER_URL = ENV == Environment.PROD ? '' : 'http://localhost:4200';

// Note: we need to add some extra pixels due to Windows' awkward window sizing api
const PUPPETEER_SIZE_HEIGHT = 480 + (ENV == Environment.PROD ? 0 : 130);
const PUPPETEER_SIZE_WIDTH = 640 + (ENV == Environment.PROD ? 0 : 16);

export class IORoomRecorder {

  private static BROWSER$: Promise<Browser>;
  private static async BROWSER(): Promise<Browser> {
    return this.BROWSER$ = this.BROWSER$ || puppeteer.launch({
      args: (ENV == Environment.PROD ? chromium.args : []).concat(PUPPETEER_ARGS).concat(`--window-size=${ PUPPETEER_SIZE_WIDTH },${ PUPPETEER_SIZE_HEIGHT }`),
      executablePath: ENV == Environment.PROD ? await chromium.executablePath : 'msedge.exe',
      defaultViewport: null, // Disable puppeteer's viewport emulation
      headless: ENV == Environment.PROD,
      ignoreHTTPSErrors: true,
    })
  }

  private readonly ROOM: IORoom;

  private PAGE: Page;
  private PAGE_CAPTURE: PageVideoCapture;

  constructor(room: IORoom) {
    this.ROOM = room;
  }

  async start() {
    if (this.PAGE) return;
        this.PAGE = await IORoomRecorder.BROWSER().then(value => value.newPage());

    await this.PAGE.goto(`${ PUPPETEER_URL }/fans/spectator`);
    await this.PAGE.waitForSelector('#activate');
    await this.PAGE.click('#activate');

    // TODO: use Event entity to grab RTMP url
    this.PAGE_CAPTURE = await PageVideoCapture.start({
      page: this.PAGE,
      options: {
        followPopups: false,
        fps: 30,
        publish: true,
      },
      savePath: 'rtmps://7011845bfc88.global-contribute.live-video.net:443/app/sk_eu-west-1_B7Tp1lHkpUfN_cCWK6vkapwJXPJueo5Lsvxbs13bF7P'
    });

    // For testing locally:
    //this.PAGE_CAPTURE = await PageVideoCapture.start({ page: this.PAGE, options: { followPopups: false, fps: 30 }, savePath: '/mnt/c/Work/test.mp4' });
    //setTimeout(() => this.PAGE_CAPTURE.stop(), 30 * 1000)
  }

  async stop() {
    if (this.PAGE == undefined) return;

    await this.PAGE.close();
    await this.PAGE_CAPTURE.stop();

    this.PAGE = undefined;
    this.PAGE_CAPTURE = undefined;
  }

}
