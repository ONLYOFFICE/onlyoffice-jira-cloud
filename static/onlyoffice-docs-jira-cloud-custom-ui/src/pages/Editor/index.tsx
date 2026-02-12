/**
 *
 * (c) Copyright Ascensio System SIA 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React, { useEffect, useState, useRef, useContext } from "react";

import Button from "@atlaskit/button/new";
import { Flex, xcss } from "@atlaskit/primitives";
import Spinner from "@atlaskit/spinner";
import { events, invoke, view } from "@forge/bridge";
import { FullContext } from "@forge/bridge/out/types";

import { Attachment, RemoteAppAuthorization } from "../../../src/types/types";
import { getAttachmentsForIssue, getUsers } from "../../client";
import { AppContext } from "../../context/AppContext";

const styles = {
  mainContainer: xcss({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    margin: "0",
    padding: "0",
    justifyContent: "center",
    alignItems: "center",
  }),
  iframe: {
    width: "100%",
    height: "100%",
    border: "unset",
  },
};

export type EditorPageProps = {
  context: FullContext;
};

const EditorPage: React.FC<EditorPageProps> = ({ context }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const remoteAppUrl = useRef<string | null>(null);
  const [token, setToken] = useState<string>();

  const issueId = context.extension.issue.id;
  const attachmentId = context.extension.modal.attachmentId;
  const mode = context.extension.modal.mode;

  const { t, setAppError } = useContext(AppContext);

  const sendMessageToIframe = (
    name: string,
    data: object | undefined | null,
  ) => {
    if (
      remoteAppUrl.current &&
      iframeRef.current &&
      iframeRef.current.contentWindow
    ) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: name,
          data: data,
        },
        remoteAppUrl.current,
      );
    }
  };

  useEffect(() => {
    events.on("JIRA_ISSUE_CHANGED", () => {
      getAttachmentsForIssue(issueId)
        .then((attachments: Attachment[]) => {
          if (
            !attachments.some((attachment) => attachment.id === attachmentId)
          ) {
            sendMessageToIframe("STOP_EDITING", {
              message: t("page.editor.messages.stop-editing-by-cause-delete"),
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching attachments:", error);
        });
    });

    let sessionTimeout: ReturnType<typeof setTimeout>;

    const scheduleReauthorization = (sessionExpires: number) => {
      const targetTime = new Date(sessionExpires);
      const now = new Date();
      targetTime.setSeconds(targetTime.getSeconds() - 10);

      const delay = targetTime.getTime() - now.getTime();

      if (delay > 0) {
        sessionTimeout = setTimeout(() => {
          invoke<RemoteAppAuthorization>("authorizeRemoteApp", {
            issueId,
            attachmentId,
          })
            .then((data: RemoteAppAuthorization) => {
              sendMessageToIframe("REFRESH_SESSION", {
                sessionExpires: data.sessionExpires,
              });
              scheduleReauthorization(data.sessionExpires);
            })
            .catch((error) => {
              console.error("Error reauthorizing session:", error);
            });
        }, delay);
      }
    };

    invoke<RemoteAppAuthorization>("authorizeRemoteApp", {
      issueId,
      attachmentId,
    })
      .then((data: RemoteAppAuthorization) => {
        setToken(data.token);
        remoteAppUrl.current = data.remoteAppUrl;
        scheduleReauthorization(data.sessionExpires);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);

        setAppError({
          title: t("error-state.common.title"),
          description: t("error-state.common.description"),
          secondaryAction: (
            <Button onClick={closeWindow}>{t("buttons.close.title")}</Button>
          ),
        });
      });

    return () => {
      clearTimeout(sessionTimeout);
    };
  }, []);

  const closeWindow = () => {
    view.close();
  };

  const onRequestUsers = (c: string, ids: string[]) => {
    getUsers(ids)
      .then((values) => {
        const users = values.map((user) => ({
          id: user.accountId,
          name: user.displayName,
          email: user.emailAddress,
          image: user.avatarUrls["24x24"],
        }));

        sendMessageToIframe("SET_USERS", {
          c: c,
          users: users,
        });
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  useEffect(() => {
    if (remoteAppUrl.current) {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== remoteAppUrl.current) return;

        const { type, data } = event.data;

        if (type === "DOCS_API_UNDEFINED") {
          setAppError({
            title: t("error-state.docs-api-undefined.title"),
            description: t("error-state.docs-api-undefined.description"),
            secondaryAction: (
              <Button onClick={closeWindow}>{t("buttons.close.title")}</Button>
            ),
          });
        }

        if (type === "PAGE_IS_LOADED") {
          setLoading(false);
        }

        if (type === "DOCUMENT_READY") {
          const { demo } = data;

          if (demo) {
            sendMessageToIframe("SHOW_MESSAGE", {
              message: t("page.editor.messages.you-using-demo-server"),
            });
          }
        }

        if (type === "REQUEST_CLOSE") {
          closeWindow();
        }

        if (type === "REQUEST_USERS") {
          const { c, ids } = data;

          onRequestUsers(c, ids);
        }
      };

      window.addEventListener("message", handleMessage);

      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }
  }, [remoteAppUrl.current]);

  return (
    <Flex xcss={styles.mainContainer}>
      {loading && <Spinner size="xlarge" label={t("labels.loading")} />}
      {token && remoteAppUrl.current && (
        <iframe
          ref={iframeRef}
          style={{
            ...styles.iframe,
            display: loading ? "none" : "block",
          }}
          src={`${remoteAppUrl.current}/editor/jira?mode=${mode}&token=${token}`}
        />
      )}
    </Flex>
  );
};

export default EditorPage;
