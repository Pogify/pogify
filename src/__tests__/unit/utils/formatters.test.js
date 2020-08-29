import { secondsToTimeFormat } from "../../../utils/formatters";

test("converting 127 seconds should equal 2:07", () => {
  expect(secondsToTimeFormat(127)).toBe("2:07");
});
