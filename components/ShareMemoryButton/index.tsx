"use client";
import { useExportMemory } from "@/contexts/chatContext";
import { useEthers } from "@/hooks/use-ethers";
import { useShareMemory } from "@/hooks/use-share-memory";
import { handleError } from "@/lib/utils";
import { DEFAULT_CONDITION } from "@/utils/constants";
import { Button, ButtonGroup, PressEvent } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { addToast, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input } from "@heroui/react";
import { AccessControlConditions } from "@lit-protocol/types";
import React, { useReducer } from "react";
import AccessControlConditionsEditor from "./access-condition-editor";

export const ChevronDownIcon = () => {
  return (
    <svg fill="none" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"
        fill="currentColor"
      />
    </svg>
  );
};

interface UploadButtonProps {
  onUploadFinished?: (arweaveTransId: string) => void;
  children?: (onOpen: () => void) => Readonly<React.ReactNode>;
}

type UploadButtonState = {
  condition: AccessControlConditions;
  isUploading: boolean;
  statusMessage: string;
  description: string;
  price: string;
  uploadButtonText: string;
}

const InitialUploadButtonState: Readonly<UploadButtonState> = {
  condition: [DEFAULT_CONDITION],
  isUploading: false,
  statusMessage: "",
  description: "",
  price: "",
  uploadButtonText: "Upload Current Memory",
};

type UploadButtonStateAction =
  | { type: "UPDATE_CONDITION", condition: AccessControlConditions }
  | { type: "UPDATE_PRICE", price: string }
  | { type: "UPDATE_DESCRIPTION", description: string }
  | { type: "UPLOADING" }
  | { type: "UPLOAD_FAILED", error: unknown }
  | { type: "UPLOAD_FINISHED" }
  | { type: "UPDATE_MESSAGE", message: string }
  | { type: "RESET" };

const UploadButtonReducer = (state: typeof InitialUploadButtonState, action: UploadButtonStateAction): typeof InitialUploadButtonState => {
  switch (action.type) {
    case "UPDATE_CONDITION": {
      return { ...state, condition: action.condition };
    }
    case "UPDATE_PRICE": {
      return { ...state, price: action.price };
    }
    case "UPDATE_DESCRIPTION": {
      return { ...state, description: action.description };
    }
    case "UPLOADING": {
      return { ...state, isUploading: true, statusMessage: "" };
    }
    case "UPLOAD_FAILED": {
      return {
        ...state,
        isUploading: false,
        statusMessage: `Upload failed`,
        uploadButtonText: InitialUploadButtonState.uploadButtonText,
      };
    }
    case "UPLOAD_FINISHED": {
      return {
        ...state,
        isUploading: false,
        statusMessage: "Upload finished",
        uploadButtonText: InitialUploadButtonState.uploadButtonText,
      };
    }
    case "UPDATE_MESSAGE": {
      return {
        ...state,
        isUploading: action.message !== "",
        uploadButtonText: action.message,
      };
    }
    case "RESET": {
      return InitialUploadButtonState;
    }
  }
}

const ShareMemoryButton: React.FC<UploadButtonProps> = ({ onUploadFinished, children }) => {
  const [state, dispatch] = useReducer(UploadButtonReducer, InitialUploadButtonState);
  const { exportMemory } = useExportMemory();
  const { connectStatus } = useEthers();
  const { executeAsync: shareMemory } = useShareMemory();
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      dispatch({ type: "RESET" });
    }
  });

  const memoryUploadRef = React.useRef<HTMLInputElement>(null);

  const handleUploadMemory = async (event?: React.ChangeEvent<HTMLInputElement> | PressEvent) => {
    dispatch({ type: "UPLOADING" });
    try {
      let file = event?.target && "files" in event.target ? event?.target.files?.[0] : undefined;
      if (event?.target && "files" in event.target) {
        console.log("Uploading Selected File", file);
        if (!file) {
          throw new Error("No file selected");
        }
      } else {
        dispatch({ type: "UPDATE_MESSAGE", message: "Preparing memory..." });
        const currentMemory = await exportMemory();
        if (!currentMemory) {
          throw new Error("No memory data available to upload");
        }

        const blob = new Blob([currentMemory], { type: "application/octet-stream" });
        file = new File([blob], `memory-${new Date().toISOString()}.snapshot`, { type: "application/octet-stream" });
      }

      dispatch({ type: "UPDATE_MESSAGE", message: "Uploading..." });
      console.log("Uploading file:", file);
      const transactionId = await shareMemory({
        data: file,
        fileName: file.name,
        condition: state.condition,
        price: state.price,
        description: state.description,
      });
      console.log("Upload result:", transactionId);

      if (!transactionId) {
        throw new Error("Upload result is empty");
      }
      onClose();
      addToast({ color: "success", title: "Share successfully" });
      onUploadFinished?.(transactionId);
      dispatch({ type: "UPLOAD_FINISHED" });
    } catch (error) {
      handleError(error, "upload memory");
      dispatch({ type: "UPLOAD_FAILED", error });
    }
  };

  const handleOpenModal = () => {
    if (connectStatus !== "connected") {
      addToast({ color: "warning", title: "Wallet not connected", description: "Please connect your wallet" });
      return;
    }
    onOpen();
  }

  return (
    <>
      {
        children?.(handleOpenModal) ?? (
          <button
            className="h-[34px] w-[122px] rounded-[50px] bg-[rgba(255,255,255,0.7)]"
            onClick={handleOpenModal}
            disabled={state.isUploading}
          >
            <span className="text-[16px] font-normal text-[#666666]">
              {state.isUploading ? "Uploading" : "Upload"}
            </span>
          </button>
        )
      }
      <Modal isOpen={isOpen} onClose={onClose} isDismissable={false} scrollBehavior="inside" size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="select-none">Encrypt & Upload Memory</ModalHeader>
              <ModalBody>
                <Input
                  label="Description"
                  placeholder="(eg. My favorite movie)"
                  value={state.description}
                  onValueChange={(value) => dispatch({ type: "UPDATE_DESCRIPTION", description: value })} />
                <Input
                  label="Requirement"
                  placeholder="(eg. Balance >0.01 ETH, or Azuki NFT > 0)"
                  value={state.price}
                  onValueChange={(value) => dispatch({ type: "UPDATE_PRICE", price: value })} />
                <Divider />
                <AccessControlConditionsEditor
                  value={state.condition}
                  onChange={(newCondition) => { dispatch({ type: "UPDATE_CONDITION", condition: newCondition }) }} />
                <input
                  id="memory-upload"
                  type="file"
                  accept=".snapshot"
                  onClick={() => {
                    dispatch({ type: "UPLOADING" });
                    dispatch({ type: "UPDATE_MESSAGE", message: "Select Snapshot" });
                    memoryUploadRef.current?.addEventListener("cancel", () => {
                      dispatch({ type: "UPLOAD_FAILED", error: new Error("Upload cancelled") });
                    }, { once: true })
                  }}
                  onChange={handleUploadMemory}
                  ref={memoryUploadRef}
                  hidden
                />
              </ModalBody>
              <ModalFooter>
                <span className="my-auto select-none">{state.statusMessage}</span>
                <Button onPress={onClose} isDisabled={state.isUploading}>Cancel</Button>
                <ButtonGroup>
                  <Button
                    color="primary"
                    isLoading={state.isUploading}
                    onPress={handleUploadMemory}
                  >
                    {state.uploadButtonText}
                  </Button>
                  <Dropdown placement="bottom-end" isDisabled={state.isUploading}>
                    <DropdownTrigger>
                      <Button color="primary" isIconOnly>
                        <ChevronDownIcon />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu selectionMode="none" onAction={(key) => {
                      if (key === "upload-current") {
                        handleUploadMemory();
                      } else if (key === "upload-snapshot") {
                        dispatch({ type: "UPDATE_MESSAGE", message: "Select Snapshot" });
                        memoryUploadRef.current?.click();
                      }
                    }}>
                      <DropdownItem key="upload-current">
                        Upload Current Memory
                      </DropdownItem>
                      <DropdownItem key="upload-snapshot">
                        Upload Memory Snapshot
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ShareMemoryButton;
