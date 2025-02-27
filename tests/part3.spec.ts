import { Page, expect, test } from "@playwright/test";

/* Map room ids to the spoken room names */
const _ROOMS: { [key: string]: string } = {
  "bedroom-square": "bedroom",
  "bathroom-square": "bathroom",
  "kitchen-square": "kitchen",
  "living-room-square": "living room",
};

/* Checks for our 4 house rooms */
const containsFourRooms = async (page: Page) => {
  const roomCount = await page
    .locator(".house-diagram > .room-square-container")
    .count();
  expect(
    roomCount,
    `Expected at least 4 rooms to be present in the house, but found ${roomCount} rooms`
  ).toBe(4);

  // Check if bedroom, bathroom, kitchen, and living room are present
  Object.keys(_ROOMS).forEach(async (roomName) => {
    const room = page.locator(
      `.house-diagram > .room-square-container > #${roomName}`
    );
    expect(
      await room.isVisible(),
      `Expected to find a room with the name "${roomName}" but did not find it`
    ).toBeTruthy();
  });
};

type LightState = { [key: string]: boolean };
/* Returns an object mapping room names to their light status */
const lightSnapshot = async (page: Page) => {
  let roomState: { [key: string]: boolean } = {};
  for (let roomName of Object.keys(_ROOMS)) {
    let room = page.locator(`#${roomName}`);
    const isOn = await room
      .getAttribute("class")
      .then((classes) => classes?.includes("lit"));
    roomState[roomName] = isOn!;
  }
  return roomState;
};

/* Checks if a light was flipped between two states */
const lightFlipped = (
  roomName: string,
  prevState: LightState,
  newState: LightState
) => {
  return prevState[roomName] !== newState[roomName];
};

/* Setup speech recognition mock with a gibberish transcript */
const setupSpeechRecognition = async (page: Page, prompts: string[]) => {
  await page.addInitScript((prompts: string[]) => {
    class SpeechRecognitionMock {
      continuous = false;
      interimResults = false;
      lang = "en-US";

      /* Our transcript will be a list of prompts, each spoken once */
      _transcript = prompts;
      _timesSpoken = 0;

      eventListeners: {
        [key: string]: Function[];
      } = {};

      addEventListener(event: string, callback: Function) {
        if (!this.eventListeners[event]) {
          this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
      }

      set onaudiostart(callback: Function) {
        this.eventListeners["audiostart"] = [];
        this.addEventListener("audiostart", callback);
      }

      set onaudioend(callback: Function) {
        this.eventListeners["audioend"] = [];
        this.addEventListener("audioend", callback);
      }

      set onend(callback: Function) {
        this.eventListeners["end"] = [];
        this.addEventListener("end", callback);
      }

      set onerror(callback: Function) {
        this.eventListeners["error"] = [];
        this.addEventListener("error", callback);
      }

      set onnomatch(callback: Function) {
        this.eventListeners["nomatch"] = [];
        this.addEventListener("nomatch", callback);
      }

      set onresult(callback: Function) {
        this.eventListeners["result"] = [];
        this.addEventListener("result", callback);
      }

      set onsoundstart(callback: Function) {
        this.eventListeners["soundstart"] = [];
        this.addEventListener("soundstart", callback);
      }

      set onsoundend(callback: Function) {
        this.eventListeners["soundend"] = [];
        this.addEventListener("soundend", callback);
      }

      set onspeechstart(callback: Function) {
        this.eventListeners["speechstart"] = [];
        this.addEventListener("speechstart", callback);
      }

      set onspeechend(callback: Function) {
        this.eventListeners["speechend"] = [];
        this.addEventListener("speechend", callback);
      }

      set onstart(callback: Function) {
        this.eventListeners["start"] = [];
        this.addEventListener("start", callback);
      }

      removeEventListener(event: string, callback: Function) {
        if (this.eventListeners[event]) {
          this.eventListeners[event] = this.eventListeners[event].filter(
            (cb) => cb !== callback
          );
        }
      }

      callEventListener(event: string, ...args: any) {
        if (this.eventListeners[event]) {
          this.eventListeners[event].forEach((callback) => {
            callback(...args);
          });
        }
      }

      start = async () => {
        this.callEventListener("start");
        this.callEventListener("audiostart");

        setTimeout(() => {
          this.callEventListener("soundstart");
          this.callEventListener("speechstart");
        }, 100);

        setTimeout(() => {
          const event = {
            results: [[{ transcript: this._transcript[this._timesSpoken] }]],
          };
          this._timesSpoken++; // Move to the next prompt
          this.callEventListener("result", event);

          setTimeout(() => {
            this.callEventListener("soundend");
            this.callEventListener("speechend");
            this.callEventListener("audioend");
            this.callEventListener("end");
          }, 100);
        }, 700);
      };

      stop = () => { };
      abort = () => { };
    }
    const recognition = SpeechRecognitionMock;
    // @ts-ignore
    window.SpeechRecognition = recognition;
    // @ts-ignore
    window.webkitSpeechRecognition = recognition;
  }, prompts);
};

async function setupSpeechSynthesis(page: Page) {
  return await page.addInitScript(() => {
    class SpeechSynthesisMock {
      _spokenText: string = "";
      speak(utterance: SpeechSynthesisUtterance) {
        this._spokenText = utterance.text;
      }
    }
    const mockSpeechSynthesis = new SpeechSynthesisMock();
    Object.defineProperty(window, "speechSynthesis", {
      value: mockSpeechSynthesis,
    });
    // @ts-ignore
    window._speechSynthesis = mockSpeechSynthesis;
  });
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date() });
});

async function testBefore(page: Page, prompts: string[]) {
  await setupSpeechSynthesis(page);
  await setupSpeechRecognition(page, prompts);

  await page.goto("/part3/index.html");
  await containsFourRooms(page);
}

// *********************************************
// *        SINGLE ROOM, SINGLE FLIP           *
// *              TESTS 1-4                    *
// *********************************************
test(
  `Will flip the bedroom light once with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, ["Flip the bedroom light"]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const newState = await lightSnapshot(page);

    expect(lightFlipped("bedroom-square", initialState, newState)).toBeTruthy();
  }
);

test(
  `Will flip the bathroom light once with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, ["Flip the bathroom light please"]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const newState = await lightSnapshot(page);

    expect(
      lightFlipped("bathroom-square", initialState, newState)
    ).toBeTruthy();
  }
);

test(
  `Will flip the kitchen light once with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, ["Kitchen light"]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const newState = await lightSnapshot(page);

    expect(lightFlipped("kitchen-square", initialState, newState)).toBeTruthy();
  }
);

test(
  `Will flip the living room light once with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, ["Living room"]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const newState = await lightSnapshot(page);

    expect(
      lightFlipped("living-room-square", initialState, newState)
    ).toBeTruthy();
  }
);

// *********************************************
// *         SINGLE ROOM, TWO FLIPS            *
// *               TESTS 5-8                   *
// *********************************************

test(
  `Will flip the bedroom light twice with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, [
      "Flip the bedroom light",
      "Flip the bedroom light",
    ]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateTwo = await lightSnapshot(page);

    expect(lightFlipped("bedroom-square", initialState, stateTwo)).toBeTruthy();

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateThree = await lightSnapshot(page);

    expect(lightFlipped("bedroom-square", stateTwo, stateThree)).toBeTruthy();
  }
);

test(
  `Will flip the bathroom light twice with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, [
      "Flip the bathroom light",
      "Flip the bathroom light",
    ]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateTwo = await lightSnapshot(page);

    expect(
      lightFlipped("bathroom-square", initialState, stateTwo)
    ).toBeTruthy();

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateThree = await lightSnapshot(page);

    expect(lightFlipped("bathroom-square", stateTwo, stateThree)).toBeTruthy();
  }
);

test(
  `Will flip the kitchen light twice with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, ["Kitchen light", "Kitchen light"]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateTwo = await lightSnapshot(page);

    expect(lightFlipped("kitchen-square", initialState, stateTwo)).toBeTruthy();

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateThree = await lightSnapshot(page);

    expect(lightFlipped("kitchen-square", stateTwo, stateThree)).toBeTruthy();
  }
);

test(
  `Will flip the living room light twice with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, ["Living room", "Living room"]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateTwo = await lightSnapshot(page);

    expect(
      lightFlipped("living-room-square", initialState, stateTwo)
    ).toBeTruthy();

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateThree = await lightSnapshot(page);

    expect(
      lightFlipped("living-room-square", stateTwo, stateThree)
    ).toBeTruthy();
  }
);

// *********************************************
// *         MULTIPLE ROOMS, SINGLE FLIP       *
// *               TESTS 9-10                  *
// *********************************************

test(
  `Will flip the bedroom and bathroom lights with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, ["Flip the bedroom light and the bathroom light"]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const newState = await lightSnapshot(page);

    let bedroom_flip = lightFlipped("bedroom-square", initialState, newState);
    let bathroom_flip = lightFlipped("bathroom-square", initialState, newState);
    expect(bedroom_flip || bathroom_flip).toBeTruthy();
  }
);

test(
  `Will flip the kitchen and living room lights with a voice command`,
  {
    annotation: { type: "points", description: ".1" },
  },
  async ({ page }) => {
    await testBefore(page, ["Kitchen light and living room"]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const newState = await lightSnapshot(page);

    let kitchen_flip = lightFlipped("kitchen-square", initialState, newState);
    let living_room_flip = lightFlipped(
      "living-room-square",
      initialState,
      newState
    );
    expect(kitchen_flip || living_room_flip).toBeTruthy();
  }
);

// *********************************************
// *      MULTIPLE ROOMS, MULTIPLE FLIPS       *
// *               TESTS 11                    *
// *********************************************

test(
  `Flips a bunch of lights`,
  {
    annotation: { type: "points", description: ".2" },
  },
  async ({ page }) => {
    await testBefore(page, [
      "Flip the bedroom light bathroom",
      "Kitchen bathroom light",
      "Bedroom",
      "Bathroom",
      "Living room and kitchen and bedroom, and bathroom",
    ]);
    const initialState = await lightSnapshot(page);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateTwo = await lightSnapshot(page);

    let bedroom_flip = lightFlipped("bedroom-square", initialState, stateTwo);
    let bathroom_flip = lightFlipped("bathroom-square", initialState, stateTwo);
    expect(bedroom_flip || bathroom_flip).toBeTruthy();

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateThree = await lightSnapshot(page);

    let kitchen_flip = lightFlipped("kitchen-square", stateTwo, stateThree);
    let bathroom_flip2 = lightFlipped("bathroom-square", stateTwo, stateThree);
    expect(kitchen_flip || bathroom_flip2).toBeTruthy();

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateFour = await lightSnapshot(page);

    let bedroom_flip2 = lightFlipped("bedroom-square", stateThree, stateFour);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateFive = await lightSnapshot(page);

    let bathroom_flip3 = lightFlipped("bathroom-square", stateFour, stateFive);

    await page.click("#voice-command");
    await page.clock.runFor(1000);
    const stateSix = await lightSnapshot(page);

    let kitchen_flip2 = lightFlipped("kitchen-square", stateFive, stateSix);
    let living_room_flip = lightFlipped(
      "living-room-square",
      stateFive,
      stateSix
    );
    let bedroom_flip3 = lightFlipped("bedroom-square", stateFive, stateSix);
    let bathroom_flip4 = lightFlipped("bathroom-square", stateFive, stateSix);
    expect(
      kitchen_flip2 || living_room_flip || bedroom_flip3 || bathroom_flip4
    ).toBeTruthy();
  }
);

// *********************************************
// *   FLIPS ONE ROOM ONCE, CHECKS SPEECH      *
// *               TESTS 12                    *
// *********************************************

test(
  `Flips the bedroom light and checks the spoken text`,
  {
    annotation: { type: "points", description: "0.5" },
  },
  async ({ page }) => {
    await testBefore(page, ["Flip the bedroom light"]);

    await page.click("#voice-command");
    await page.clock.runFor(1000);

    const spokenText = await page.evaluate(() => {
      // @ts-ignore
      return window._speechSynthesis._spokenText;
    });

    expect(spokenText.toLowerCase()).toContain("bedroom");
  }
);

// *********************************************
// *   FLIPS NOTHING, CHECKS SPEECH            *
// *               TESTS 13                    *
// *********************************************

test(
  `Says some garbage and checks the spoken text`,
  {
    annotation: { type: "points", description: "0.3" },
  },
  async ({ page }) => {
    await testBefore(page, ["Water my plants"]);

    await page.click("#voice-command");
    await page.clock.runFor(1000);

    const spokenText = await page.evaluate(() => {
      // @ts-ignore
      return window._speechSynthesis._spokenText;
    });

    expect(spokenText.toLowerCase()).toContain("understand");
  }
);
