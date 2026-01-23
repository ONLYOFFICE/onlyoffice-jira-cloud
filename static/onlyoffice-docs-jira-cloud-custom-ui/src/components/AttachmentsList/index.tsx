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

import React, { useContext } from "react";

import { IconButton, IconProp } from "@atlaskit/button/new";
import DynamicTable from "@atlaskit/dynamic-table";
import { Box, Flex, Stack, Text, xcss } from "@atlaskit/primitives";
import bytes from "bytes";

import { Attachment } from "../../../src/types/types";
import { AppContext } from "../../context/AppContext";

const styles = {
  mainContainer: xcss({
    width: "100%",
  }),
  lineContainer: xcss({
    display: "flex",
    alignItems: "center",
    paddingTop: "space.050",
    paddingBottom: "space.050",
    paddingLeft: "space.200",
    paddingRight: "space.200",
    justifyContent: "space-between",
    gap: "space.200",
  }),
  iconContainer: xcss({
    display: "flex",
    alignItems: "center",
  }),
  infoContainer: xcss({
    flex: "1",
  }),
  actionsContainer: xcss({
    flexDirection: "row",
    gap: "space.050",
  }),
  cleanContainer: xcss({
    display: "block",
    width: "100%",
    position: "absolute",
  }),
};

export type Actions = {
  icon: IconProp;
  label: string;
  condition: (attachment: Attachment) => boolean;
  onClick: (attachment: Attachment) => void;
};

export type AttachmentsListProps = {
  attachments: Attachment[];
  isLoading?: boolean;
  actions: Actions[];
  timeZone: string;
  locale: string;
  emptyView?: React.ReactElement;
  filter: (attachment: Attachment) => boolean;
  getIcon: (attachment: Attachment) => JSX.Element;
};

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  isLoading,
  actions,
  timeZone,
  locale,
  emptyView,
  filter,
  getIcon,
}) => {
  const { t } = useContext(AppContext);

  const getFormatedDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timeZone,
    };

    const date = new Date(dateString);

    return new Intl.DateTimeFormat(locale, options).format(date);
  };

  const createBaseCells = (
    attachment: Attachment,
    index: number,
    actions: Actions[],
  ) => [
    {
      key: "cell",
      content: (
        <Flex key={attachment.id} xcss={styles.lineContainer}>
          <Box xcss={styles.iconContainer}>{getIcon(attachment)}</Box>

          <Stack xcss={styles.infoContainer}>
            <Text size="medium" weight="medium">
              {attachment.filename}
            </Text>
            <Text size="small" weight="medium" color="color.text.subtle">
              {t("labels.last-updated")
                .replace("{size}", String(bytes(attachment.size)))
                .replace("{time}", getFormatedDate(attachment.created))
                .replace("{user}", attachment.author.displayName)}
            </Text>
          </Stack>

          <Stack xcss={styles.actionsContainer}>
            {actions.map((action) => (
              <IconButton
                key={attachment.id + action.label}
                appearance="subtle"
                icon={action.icon}
                label={action.label}
                title={action.label}
                isDisabled={!action.condition(attachment)}
                onClick={() => action.onClick(attachment)}
              />
            ))}
          </Stack>
        </Flex>
      ),
    },
  ];

  const rows = attachments
    .filter((attachment: Attachment) => filter(attachment))
    .map((attachment: Attachment, index: number) => ({
      key: attachment.id,
      cells: createBaseCells(attachment, index, actions),
    }));

  return (
    <>
      <Box xcss={styles.mainContainer}>
        <DynamicTable
          testId="attachemtsList"
          isLoading={isLoading}
          rows={rows}
          rowsPerPage={6}
          defaultPage={1}
          emptyView={emptyView}
        />
      </Box>
    </>
  );
};
