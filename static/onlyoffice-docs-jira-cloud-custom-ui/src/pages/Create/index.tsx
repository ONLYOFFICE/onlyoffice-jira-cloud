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

import React, { Fragment, useContext } from "react";

import Button from "@atlaskit/button/new";
import Form, { ErrorMessage, MessageWrapper, Field } from "@atlaskit/form";
import {
  FullScreenModalDialog,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@atlaskit/modal-dialog/full-screen";
import Select, { OptionType, ValueType } from "@atlaskit/select";
import Textfield from "@atlaskit/textfield";
import { invoke, showFlag, view } from "@forge/bridge";
import { FullContext } from "@forge/bridge/out/types";

import { Attachment } from "../../../src/types/types";
import { AppContext } from "../../context/AppContext";

const forbiddenChars = /[\\/:*?"<>|]/;
const documentTypeOptions = ["word", "cell", "slide", "pdf"];

export type CreatePageProps = {
  context: FullContext;
};

const CreatePage: React.FC<CreatePageProps> = ({ context }) => {
  const issueId = context.extension.issue.id;
  const locale = context.locale;

  const { t } = useContext(AppContext);

  const onSubmit = async (data: {
    title: string;
    type: ValueType<OptionType>;
  }) => {
    const { title, type } = data;

    const errors = {
      title: forbiddenChars.test(data.title)
        ? t("page.create.messages.invalid-file-name")
        : undefined,
    };

    if (!errors.title) {
      return invoke<Attachment>("createAttachment", {
        issueId,
        title,
        type: type?.value,
        locale,
      })
        .then((attachment: Attachment) => {
          showFlag({
            id: "create-attachment-success",
            title: t("page.create.messages.attachment-created").replace(
              "{filename}",
              attachment.filename,
            ),
            type: "success",
            appearance: "success",
            isAutoDismiss: true,
          });

          view.close(attachment);
        })
        .catch((error) => {
          console.error("Error creating attachment:", error);

          showFlag({
            id: "create-attachment-error",
            title: t("page.create.messages.create-attachment-failed"),
            type: "error",
            appearance: "error",
            isAutoDismiss: true,
          });
        });
    }

    return errors;
  };

  const onClose = () => {
    view.close();
  };

  return (
    <FullScreenModalDialog onClose={onClose}>
      <Form onSubmit={onSubmit}>
        {({ formProps, submitting }) => (
          <form style={{ height: "100%" }} {...formProps}>
            <ModalHeader hasCloseButton>
              <ModalTitle>{t("page.create.title")}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Field
                label={t("page.create.fields.title")}
                name="title"
                defaultValue={t("page.create.fields.new-document")}
                isRequired
                isDisabled={submitting}
              >
                {({ fieldProps, error }) => (
                  <Fragment>
                    <Textfield {...fieldProps} />
                    <MessageWrapper>
                      {error && <ErrorMessage>{error}</ErrorMessage>}
                    </MessageWrapper>
                  </Fragment>
                )}
              </Field>

              <Field<ValueType<OptionType>>
                label={t("page.create.fields.document-type.title")}
                name="type"
                id="type"
                defaultValue={{
                  label: t(
                    "page.create.fields.document-type.options." +
                      documentTypeOptions[0],
                  ),
                  value: documentTypeOptions[0],
                }}
                isRequired
                isDisabled={submitting}
              >
                {({ fieldProps: { id, ...rest } }) => (
                  <Select
                    id={`${id}-select`}
                    isSearchable={false}
                    options={documentTypeOptions.map((type) => ({
                      label: t(
                        "page.create.fields.document-type.options." + type,
                      ),
                      value: type,
                    }))}
                    {...rest}
                  />
                )}
              </Field>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose} appearance="subtle">
                {t("buttons.cancel.title")}
              </Button>
              <Button type="submit" appearance="primary" isLoading={submitting}>
                {t("buttons.create.title")}
              </Button>
            </ModalFooter>
          </form>
        )}
      </Form>
    </FullScreenModalDialog>
  );
};

export default CreatePage;
