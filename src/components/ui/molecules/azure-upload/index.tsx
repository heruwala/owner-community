import { Upload } from 'antd';
import axios from 'axios';
import ImgCrop from 'antd-img-crop';
import imageCompression from 'browser-image-compression';
import React, { useRef } from 'react';

import { UploadFile, UploadProps, RcFile } from 'antd/lib/upload/interface';
import { BlobIndexTag, BlobMetadataField } from '../../../../generated';

interface UploadButtonProp {
  authorizeRequest: (file:File) => Promise<AuthResult>
  blobPath: string
  onChange?: (value:any) => void
  onRemoveRequested?: () => Promise<boolean>
  permittedContentTypes?: string[]
  permittedExtensions?: string[]
  maxFileSizeBytes?: number
  maxWidthOrHeight?: number
  onSuccess?: (file: UploadFile) => void
  button?: React.ReactNode
}

export type UploadButtonProps = UploadButtonProp;

export interface AuthResult {
  isAuthorized: boolean;
  authHeader: {
    authHeader?: string;
    requestDate?: string;
    indexTags?: BlobIndexTag[];
    metadataFields?: BlobMetadataField[];
    blobPath?: string;
  };
}
interface ComponentProp {
  data: {
    permittedContentTypes?: string[];
    permittedExtensions?: string[];
    maxFileSizeBytes?: number;
    maxWidthOrHeight?: number;
    notificationCount?: number;
    blobPath: string;
  };
  onInvalidContentType?: () => void;
  onInvalidContentLength?: () => void;
  onSuccess?: (file: UploadFile) => void;
  onError?: (file: File, error: any) => void;
  onRemoveRequested?: (file: UploadFile<unknown>) => Promise<boolean>;
  authorizeRequest: (file: File) => Promise<AuthResult>;
  cropperProps?: object;
  uploadProps?: UploadProps;
  children?: React.ReactNode;
  maxFileCount?: number;
}

export type AzureUploadProps = ComponentProp;

export const AzureUpload: React.FC<AzureUploadProps> = (props) => {
  const authResultRef = useRef<AuthResult | undefined>(undefined);

  const beforeUpload = async (file: RcFile) => {
    const isValidContentType = props.data.permittedContentTypes && props.data.permittedContentTypes.includes(file.type);

    if (!isValidContentType) {
      if (props.onInvalidContentType) {
        props.onInvalidContentType();
      }
      return Upload.LIST_IGNORE;
    }

    let newFile: RcFile;
    if (file.type.startsWith('image/') && (props.data.maxFileSizeBytes || props.data.maxWidthOrHeight)) {
      try {
        console.log('beforeCompression size:', file.size);
        let options: any = {};
        if (props.data.maxFileSizeBytes) {
          options.maxSizeMB = props.data.maxFileSizeBytes / 1024 / 1024;
        }
        if (props.data.maxWidthOrHeight) {
          options.maxWidthOrHeight = props.data.maxWidthOrHeight;
        }
        console.log('beforeCompression options:', options);
        const uid = file.uid;
        newFile = (await imageCompression(file, options)) as RcFile;
        file.uid = uid;
        console.log('afterCompression size:', newFile.size);
        const isValidContentLength = props.data.maxFileSizeBytes && newFile.size <= props.data.maxFileSizeBytes;

        if (!isValidContentLength) {
          if (props.onInvalidContentLength) {
            props.onInvalidContentLength();
          }
        }
      } catch (error) {
        console.error('cannot compress:', error);
        return Upload.LIST_IGNORE;
      }
    } else {
      newFile = file;
    }

    if (isValidContentType) {
      const result = await props.authorizeRequest(newFile);
      if (result.isAuthorized) {
        //@ts-ignore
        newFile['url'] = result.blobPath;
        console.log('file', newFile);
        authResultRef.current = result;
        return newFile;
      }
    }
    return Upload.LIST_IGNORE;
  };

  const customizeUpload = async (option: any) => {
    //   const result =  await props.authorizeRequest(option.file) as AuthResult;
    if (authResultRef.current && authResultRef.current.isAuthorized) {
      const { authHeader } = authResultRef.current;

      try {
        option.file.url = authHeader.blobPath;

        let metadataHeaders: any = {}
        if (authHeader.metadataFields) {
          for (const [_, value] of Object.entries(authHeader.metadataFields)) {
            metadataHeaders['x-ms-meta-' + value.name] = value.value;
          }
        }

        let indexTagsHeaders: any = {}
        if (authHeader.indexTags) {
          const output = authHeader.indexTags.reduce((acc: Record<string, string>, cur: { name: string, value: string }) => {
            acc[cur.name] = cur.value;
            return acc;
          }, {});

          indexTagsHeaders['x-ms-tags'] = new URLSearchParams(output).toString();
        }

        let response = await axios.request({
          method: 'put',
          url: authHeader.blobPath,
          data: new Blob([option.file], { type: option.file.type }),
          headers: {
            ...option.headers,
            ...metadataHeaders,
            ...indexTagsHeaders,
            Authorization: authHeader.authHeader,
            'x-ms-blob-type': 'BlockBlob',
            'x-ms-version': '2021-04-10',
            'x-ms-date': authHeader.requestDate,
            'Content-Type': option.file.type
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent !== undefined && progressEvent.total !== undefined && progressEvent.loaded !== undefined) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              option.onProgress({ percent: percentCompleted }, option.file);
            }
          }
        });

        console.log('uploaded:', option.file);
        if (props.onSuccess) {
          props.onSuccess(option.file);
        }
        option.onSuccess(response, option.file);
      } catch (uploadError) {
        if (props.onError) {
          props.onError(option.file, uploadError);
        }
        option.onError(uploadError, option.file);
      }
    } else {
      // not authorized - do nothing
    }
    return option;
  };
  const validFileExtensions = props.data.permittedExtensions
    ? '.' + props.data.permittedExtensions.join(', .')
    : undefined;
  console.log('validFileExtensions', validFileExtensions);

  if (props.cropperProps) {
    return (
      <ImgCrop {...props.cropperProps}>
        <Upload
          accept={validFileExtensions}
          customRequest={customizeUpload}
          beforeUpload={beforeUpload}
          onRemove={(file) => {
            return props.onRemoveRequested ? props.onRemoveRequested(file) : undefined;
          }}
          showUploadList={false}
          progress={{
            strokeColor: {
              '0%': '#108ee9',
              '100%': '#87d068'
            },
            strokeWidth: 3,
            format: (percent) => (percent ? `${parseFloat(percent.toFixed(2))}%` : '')
          }}
          {...props.uploadProps}
        >
          {props.children}
        </Upload>
      </ImgCrop>
    );
  }
  return (
    <Upload
      accept={validFileExtensions}
      customRequest={customizeUpload}
      beforeUpload={beforeUpload}
      onRemove={(file) => {
        return props.onRemoveRequested ? props.onRemoveRequested(file) : undefined;
      }}
      maxCount={props.maxFileCount}
      showUploadList={false}
      progress={{
        strokeColor: {
          '0%': '#108ee9',
          '100%': '#87d068'
        },
        strokeWidth: 3,
        format: (percent) => (percent ? `${parseFloat(percent.toFixed(2))}%` : '')
      }}
      {...props.uploadProps}
    >
      {props.children}
    </Upload>
  );
};
