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

import { requestJira } from "@forge/bridge";

import {
  Attachment,
  ClientError,
  Issue,
  Permission,
  User,
} from "../../src/types/types";

export const getUsers = async (ids: string[]): Promise<User[]> => {
  return await _executeRequest<User[]>(
    async () => {
      return await requestJira(
        `/rest/api/3/user/bulk?maxResults=200&${"&" + ids.map((id) => `accountId=${id}`).join("&")}`,
      );
    },
    async (response: Response) => {
      const data = await response.json();

      return data.values;
    },
  );
};

export const getIssue = async (issueId: string): Promise<Issue> => {
  return await _executeRequest<Issue>(
    async () => {
      return await requestJira(
        `/rest/api/3/issue/${issueId}?fields=attachment`,
      );
    },
    (response: Response) => {
      return response.json();
    },
  );
};

export const getAttachmentsForIssue = async (
  issueId: string,
): Promise<Attachment[]> => {
  return getIssue(issueId).then((issue: Issue) => {
    const attachments = issue.fields.attachment;
    return [...attachments].sort((a, b) => {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
  });
};

export const getPermissions = async (
  issueId: string,
  permissions: string[],
) => {
  return await _executeRequest<Record<string, Permission>>(
    async () => {
      return await requestJira(
        "/rest/api/3/mypermissions?issueId=" +
          issueId +
          "&permissions=" +
          permissions.join(","),
      );
    },
    async (response: Response) => {
      const data = await response.json();

      return data.permissions || {};
    },
  );
};

async function _executeRequest<T>(
  onRequest: () => Promise<Response>,
  onResponse: (response: Response) => T | Promise<T>,
) {
  const response = await onRequest();

  if (response.ok || response.status === 303) {
    return await onResponse(response);
  }

  throw new ClientError(
    `Request failed with status ${response.status}: ${response.statusText}`,
    response.status,
  );
}
