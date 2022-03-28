import React from "react";
import { unmountComponentAtNode } from "react-dom";
import renderer from "react-test-renderer";
import Author from "../../api/models/Author";

import Mainpage from "../Mainpage";

let container: any = null;
const testUser: Author = {
  type: "author",
  id: "",
  displayName: "",
  github: " ",
  profileImage: " ",
  isAdmin: false,
};
//issues with container type and its methods

beforeEach(() => {
  // setup a DOM element as a render target
  container = document?.createElement("div");
  document?.body?.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container?.remove();
  container = null;
});

describe("Mainpage suite", () => {
  it("Renders correctly", () => {
    const tree = renderer.create(<Mainpage currentUser={testUser} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
