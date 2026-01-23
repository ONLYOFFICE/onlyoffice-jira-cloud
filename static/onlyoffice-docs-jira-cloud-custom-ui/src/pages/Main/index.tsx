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

import React, { useContext, useEffect, useState } from "react";

import Button from "@atlaskit/button/new";
import DownloadIcon from "@atlaskit/icon/core/download";
import EditIcon from "@atlaskit/icon/core/edit";
import EyeOpenIcon from "@atlaskit/icon/core/eye-open";
import { Box, Text, xcss } from "@atlaskit/primitives";
import { Modal, events, invoke, router } from "@forge/bridge";
import { FullContext } from "@forge/bridge/out/types";

import { AttachmentsList } from "../../../src/components/AttachmentsList";
import { Attachment, Format, Permission } from "../../../src/types/types";
import { useFormats } from "../../../src/util/formats";
import { ReactComponent as CellIcon } from "../../assets/images/cell.svg";
import { ReactComponent as DiagramIcon } from "../../assets/images/diagram.svg";
import { ReactComponent as OnlyofficeButtonIcon } from "../../assets/images/onlyoffice-button.svg";
import { ReactComponent as PdfIcon } from "../../assets/images/pdf.svg";
import { ReactComponent as SlideIcon } from "../../assets/images/slide.svg";
import { ReactComponent as UnknownIcon } from "../../assets/images/unknown.svg";
import { ReactComponent as WordIcon } from "../../assets/images/word.svg";
import { getAttachmentsForIssue, getPermissions } from "../../client";
import { AppContext } from "../../context/AppContext";

const styles = {
  buttonContainer: xcss({
    width: "100%",
    padding: "space.100",
  }),
};

const editorModal = new Modal({
  resource: "custom-ui",
  size: "max",
  context: {
    pageId: "editor",
  },
  closeOnEscape: false,
  closeOnOverlayClick: false,
});

const createModal = new Modal({
  resource: "custom-ui",
  size: "medium",
  context: {
    pageId: "create",
  },
});

export type EditorPageProps = {
  context: FullContext;
};

const MainPage: React.FC<EditorPageProps> = ({ context }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission>>();
  const [formats, setFormats] = useState<Format[]>([]);

  const issueId = context?.extension.issue.id;
  const timeZone = context.timezone;
  const locale = context.locale;

  const { t, setAppError } = useContext(AppContext);
  const { isEditable, getDocumentType } = useFormats(formats);

  useEffect(() => {
    events.on("JIRA_ISSUE_CHANGED", () => {
      getAttachmentsForIssue(issueId)
        .then((attachments: Attachment[]) => {
          setAttachments(attachments);
        })
        .catch((error) => {
          console.error("Error fetching attachments:", error);
        });
    });

    const loadData = async () => {
      try {
        const [attachments, permissions, formats] = await Promise.all([
          getAttachmentsForIssue(issueId),
          getPermissions(issueId, [
            "CREATE_ATTACHMENTS",
            "DELETE_ALL_ATTACHMENTS",
            "DELETE_OWN_ATTACHMENTS",
          ]),
          invoke<Format[]>("getFormats"),
        ]);

        setAttachments(attachments);
        setPermissions(permissions);
        setFormats(formats);
      } catch (error) {
        console.error("Error fetching data:", error);

        setAppError({
          title: t("error-state.common.title"),
          description: t("error-state.common.description"),
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const createNewDocument = () => {
    createModal.onClose = (payload: { id: string }) => {
      setTimeout(() => {
        if (payload) {
          const { id } = payload;

          openEditor(id, "EDIT");
        }
      }, 500);
    };
    createModal.open();
  };

  const openEditor = async (attachmentId: string, mode: "VIEW" | "EDIT") => {
    editorModal.context.attachmentId = attachmentId;
    editorModal.context.mode = mode;
    editorModal.open();
  };

  const download = (attachmentId: string) => {
    invoke<string>("getAttachmentContentUrl", { attachmentId }).then(
      (attachmentContentUrl: string) => {
        router.open(attachmentContentUrl);
      },
    );
  };

  const attachmentsFilter = (attachment: Attachment) => {
    return Boolean(getDocumentType(attachment.filename));
  };

  const getIcon = (attachment: Attachment) => {
    const documentType = getDocumentType(attachment.filename);

    switch (documentType) {
      case "word":
        return <WordIcon />;
      case "cell":
        return <CellIcon />;
      case "slide":
        return <SlideIcon />;
      case "pdf":
        return <PdfIcon />;
      case "diagram":
        return <DiagramIcon />;
      default:
        return <UnknownIcon />;
    }
  };

  const editCondition = (attachment: Attachment) => {
    if (!permissions?.["CREATE_ATTACHMENTS"].havePermission) {
      return false;
    }

    let editPermission;

    if (attachment.author.accountId !== context.accountId) {
      editPermission = permissions?.["DELETE_ALL_ATTACHMENTS"].havePermission;
    } else {
      editPermission =
        permissions?.["DELETE_ALL_ATTACHMENTS"].havePermission ||
        permissions?.["DELETE_OWN_ATTACHMENTS"].havePermission;
    }

    return editPermission && isEditable(attachment.filename);
  };

  return (
    <>
      {permissions?.["CREATE_ATTACHMENTS"].havePermission &&
        (permissions?.["DELETE_ALL_ATTACHMENTS"].havePermission ||
          permissions?.["DELETE_OWN_ATTACHMENTS"].havePermission) && (
          <Box xcss={styles.buttonContainer}>
            <Button
              title={t("buttons.create-in-app.title")}
              iconBefore={OnlyofficeButtonIcon}
              onClick={createNewDocument}
            >
              {t("buttons.create-in-app.title")}
            </Button>
          </Box>
        )}
      <AttachmentsList
        attachments={attachments}
        isLoading={loading}
        actions={[
          {
            icon: EditIcon,
            label: t("buttons.edit-in-app.title"),
            condition: (attachment) => editCondition(attachment),
            onClick: (attachment) => {
              openEditor(attachment.id, "EDIT");
            },
          },
          {
            icon: EyeOpenIcon,
            label: t("buttons.view-in-app.title"),
            condition: () => true,
            onClick: (attachment) => {
              openEditor(attachment.id, "VIEW");
            },
          },
          {
            icon: DownloadIcon,
            label: t("buttons.download.title"),
            condition: () => true,
            onClick: (attachment) => {
              download(attachment.id);
            },
          },
        ]}
        timeZone={timeZone}
        locale={locale}
        emptyView={<Text>{t("page.main.empty-file-list")}</Text>}
        filter={attachmentsFilter}
        getIcon={getIcon}
      />
    </>
  );
};

export default MainPage;
