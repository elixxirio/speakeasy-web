import { FC, useState } from "react";
import s from "./RegisterView.module.scss";
import { ModalCtaButton } from "@components/common";
import {
  NormalSpeakeasy,
  OpenSource,
  NormalHash,
  RoadMap,
  Chat
} from "@components/icons";
import cn from "classnames";

const RegisterView: FC<{
  onConfirm: Function;
}> = ({ onConfirm }) => {
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [error, setError] = useState<string>("");

  return (
    <div className={cn("", s.root)}>
      <div className={cn("w-full flex flex-col", s.wrapper)}>
        <div className={cn(s.header)}>
          <NormalSpeakeasy />
        </div>
        <div className={cn("grid grid-cols-12 gap-0", s.content)}>
          <div className="col-span-9 flex flex-col items-start">
            <span className={cn(s.golden)}>True Freedom</span>
            <span className={cn(s.thick)}>to express yourself,</span>
            <span className={cn(s.golden)}>your thoughts, your beliefs.</span>
            <span className={cn(s.normal)}>
              Speak easily to a group of friends or a global community.{" "}
              <span className={cn(s.highlighted)}>
                Talk about what you want.
              </span>
            </span>
            <span className={cn(s.normal)}>
              Surveillance free. Censorship proof.
              <span className={cn(s.highlighted)}>
                Your speakeasy is yours.
              </span>
            </span>
          </div>
          <div className="col-span-3 pl-3">
            <h1
              style={{
                color: "#ECBA5F",
                textAlign: "center",
                fontSize: "48px",
                marginTop: "72px"
              }}
            >
              Coming <br />
              soon...
            </h1>
            {/* <h2 className="mb-2">Join the alpha</h2> */}

            {/* <p
              className="mb-8 text"
              style={{ color: "#5B5D62", lineHeight: "17px" }}
            >
              Enter a password to secure your soverign speakeasy identity
            </p> */}
            {/* <input
              type="password"
              placeholder="Enter your password"
              className=""
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
            /> */}

            {/* <input
              type="password"
              placeholder="Confirm your password"
              className="mt-4"
              value={passwordConfirm}
              onChange={e => {
                setPasswordConfirm(e.target.value);
              }}
            /> */}
            {/* {error && (
              <div
                className={"text text--xs mt-4"}
                style={{ color: "var(--red)" }}
              >
                {error}
              </div>
            )} */}

            {/* <div
            style={{
              color: "var(--red)",
              marginTop: "14px",
              fontSize: "11px",

              textAlign: "center",
              border: "solid 1px #E3304B",
              backgroundColor: "rgba(227, 48, 75, 0.1)",
              padding: "16px"
            }}
          >
            Warning: Your password cannot be recovered or changed, please make
            sure to keep it safe.
          </div> */}

            {/* <div className="flex flex-col mt-4">
              <ModalCtaButton
                buttonCopy="Continue"
                cssClass={s.button}
                onClick={() => {
                  if (passwordConfirm !== password) {
                    setError("Password doesn't match confirmation.");
                  } else {
                    if (password.length) {
                      onConfirm(password);
                    }
                    setError("");
                  }
                }}
              />
            </div> */}
          </div>
        </div>
        <div className={cn("grid grid-cols-12 gap-0", s.footer)}>
          <a
            className={cn("flex flex-col col-span-3", s.perkCard)}
            href="https://www.speakeasy.tech/open-source/"
            target="_blank"
            rel="noreferrer"
          >
            <OpenSource />
            <span className={cn(s.perkCard__title)}>Open Source</span>
            <span className={cn(s.perkCard__description)}>
              Every line — open source. Forever.
            </span>
          </a>
          <a
            className={cn("flex flex-col col-span-3", s.perkCard)}
            href="https://www.speakeasy.tech/how-it-works/"
            target="_blank"
            rel="noreferrer"
          >
            <NormalHash />
            <span className={cn(s.perkCard__title)}>
              Fundamentally Different
            </span>
            <span className={cn(s.perkCard__description)}>
              Powered by the first decentralized mixnet-blockchain
            </span>
          </a>
          <a
            className={cn("flex flex-col col-span-3", s.perkCard)}
            href="https://www.speakeasy.tech/roadmap/"
            target="_blank"
            rel="noreferrer"
          >
            <RoadMap />
            <span className={cn(s.perkCard__title)}>Roadmap</span>
            <span className={cn(s.perkCard__description)}>
              Building to the future
            </span>
          </a>
          <div className={cn("flex flex-col col-span-3", s.perkCard)}>
            <Chat />
            <span className={cn(s.perkCard__title)}>
              Join the discussion on the official feedback speakeasy (SOON)
            </span>
          </div>
        </div>
      </div>
      <div className={cn(s.links)}>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          Join the Discussion
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          Contact
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          xx network
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          xx foundation
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          xx messenger
        </a>
        <a href="https://xx.network" target="_blank" rel="noreferrer">
          twitter
        </a>
      </div>
    </div>
  );
};

export default RegisterView;
