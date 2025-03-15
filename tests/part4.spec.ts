import { Page, expect, test } from "@playwright/test";

async function setupUserMediaMock(page: Page) {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async (...args) => {
      const [constraints] = args;
      console.log("constraints", constraints);

      if (constraints === undefined) {
        throw new Error("Video is required!");
      }
      console.log(typeof constraints.video)
      if (typeof constraints.video !== 'boolean'&& typeof constraints.video !== 'object') {
        throw new Error("Video constraints must be a boolean or an object!");
      }

      if (typeof constraints.video === 'boolean' && !constraints.video) {
        throw new Error("... why would you set video to be false?")
      }
      
      const videoConstraints = constraints.video;

      if (videoConstraints.width !== undefined) {
        if (typeof videoConstraints.width !== 'number' && typeof videoConstraints.width !== 'object') {
          throw new Error("Video width must be a number or an object!");
        }
        if (typeof videoConstraints.width === 'number' && videoConstraints.width < 0) {
          throw new Error("Video width must be a non-negative number!");
        }
        let vidWidth = videoConstraints.width
        if (typeof vidWidth.min !== undefined && typeof vidWidth.min === 'number' && vidWidth.min < 0) {
          throw new Error("Video width must have a positive min")
        }
        if (typeof vidWidth.max !== undefined && typeof vidWidth.max === 'number' && vidWidth.max < 0) {
          throw new Error("Video width must have a positive max")
        }
        if (typeof vidWidth.ideal !== undefined && typeof vidWidth.ideal === 'number' && vidWidth.ideal < 0) {
          throw new Error("Video width must have a positive ideal")
        }
      }

      if (videoConstraints.height !== undefined) {
        if (typeof videoConstraints.height !== 'number' && typeof videoConstraints.height !== 'object') {
          throw new Error("Video height must be a number or an object!");
        }
        if (typeof videoConstraints.height === 'number' && videoConstraints.height < 0) {
          throw new Error("Video height must be a non-negative number!");
        }
        let vidHeight = videoConstraints.height
        if (typeof vidHeight.min !== undefined && typeof vidHeight.min === 'number' && vidHeight.min < 0) {
          throw new Error("Video width must have a positive min")
        }
        if (typeof vidHeight.max !== undefined && typeof vidHeight.max === 'number' && vidHeight.max < 0) {
          throw new Error("Video width must have a positive max")
        }
        if (typeof vidHeight.ideal !== undefined && typeof vidHeight.ideal === 'number' && vidHeight.ideal < 0) {
          throw new Error("Video width must have a positive ideal")
        }
      }

      if (videoConstraints.frameRate !== undefined) {
        if (typeof videoConstraints.frameRate !== 'number' || videoConstraints.frameRate <= 0) {
          throw new Error("Video frameRate must be a positive number!");
        }
      }

      if (videoConstraints.facingMode !== undefined || videoConstraints.deviceId !== undefined) {
        throw new Error("DeviceId and facingMode not supported for AutoGrader")
      }

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("2d context is not supported");
      }
      ctx!.fillStyle = "#3d1a96";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      const canvasStream =  canvas.captureStream();
      const videoTrack = canvasStream.getVideoTracks()[0];

      const stream = new MediaStream();
      stream.addTrack(videoTrack);

      // @ts-ignore
      stream._is_mock = true;

      return stream;
    };
  });
}

test.beforeEach(async ({ page }) => {
  try {
    await setupUserMediaMock(page);
  } catch (e) {
    console.error(e);
  }
  await page.waitForTimeout(3000);
  // @ts-ignore
  await page.goto("/part4/index.html", {
    waitUntil: "domcontentloaded",
  });
});

// *********************************************
// *          LOCAL STORAGE TESTS              *
// *              TESTS 1-2                    *
// *********************************************

test(
  `Test 1: Check if the username is stored in the local storage`,
  {
    annotation: { type: "points", description: "0.5" },
  },
  async ({ page }) => {
    const username = page.locator("#name-input");

    await page.fill("#name-input", "Chris");
    await page.reload();

    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(500);

    expect(await username.inputValue()).toBe("Chris");
  }
);

test(
  `Test 2: Check if the video element is properly displayed with webcam feed`,
  {
    annotation: { type: "points", description: "0.5" },
  },
  async ({ page }) => {
    const pfp = page.locator("#profile-pic");

    pfp.click();
    // need to wait for modal event to fire, video to load in, etc.
    await page.waitForTimeout(500);

    const video = await page.waitForSelector("#video");

    expect(await video.isVisible()).toBe(true);

    // @ts-ignore
    console.log(await video.evaluate((el) => el.srcObject._is_mock));

    // TODO: add the following line. seem to have forgotten this for su24/sp25
    // @ts-ignore
    //expect(await video.evaluate((el) => el.srcObject._is_mock)).toBe(true);
  }
);

test(
  "Test 3: data URL is as expected (this might be flaky; if it fails, we'll still check manually!)",
  {
    annotation: { type: "points", description: "1" },
  },
  async ({ page }) => {
    const pfp = page.locator("#profile-pic");

    pfp.click();

    const video = await page.waitForSelector("#video");
    await page.waitForTimeout(1000);

    await page.locator(".modal-footer button").click();

    await page.waitForTimeout(500);

    await page.reload();

    await page.waitForLoadState("domcontentloaded");

    const dataUrl = (await page
      .locator("#profile-pic")
      .getAttribute("src")) as string;

    const allPixelsGood = await page.evaluate((dataUrl: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 2;
      canvas.height = 2;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = dataUrl;
      ctx!.drawImage(img, 0, 0);

      let allPixelsGood = true;

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const pixel = ctx!.getImageData(i, j, 1, 1).data;
          console.log(pixel[0], pixel[1], pixel[2]);
          const expected = [61, 26, 150];
          const allowError = 15; // TERRIBLE. what has the world come to.

          if (
            pixel[0] < expected[0] - allowError ||
            pixel[0] > expected[0] + allowError ||
            pixel[1] < expected[1] - allowError ||
            pixel[1] > expected[1] + allowError ||
            pixel[2] < expected[2] - allowError ||
            pixel[2] > expected[2] + allowError
          ) {
            allPixelsGood = false;
            break;
          }
        }
      }

      return allPixelsGood;
    }, dataUrl);

    expect(allPixelsGood).toBe(true);
  }
);
