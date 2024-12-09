import React, { useState, useCallback, useRef } from "react";
import GlobalDialog from "@/modal/GlobalDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useObjectContext } from "@/context/objects";
import toast from "react-hot-toast";
import { Form } from "react-hook-form";

interface AddMediaProps {
  children: React.ReactElement;
  type: "image" | "video";
  schemaKey: string;
  handleCropModal?: (base64String: string, name: string) => void;
  titleH?: string;
  defaultId?: string;
}
const MAX_FILE_SIZE = 20; // 20 MB in bytes

const AddMedia: React.FC<AddMediaProps> = ({
  children,
  type,
  schemaKey,
  handleCropModal,
  titleH,
  defaultId,
}) => {
  // console.log("schemaKey", schemaKey)
  const { updateOrAddItem, currentObject } = useObjectContext();
  const defaultValue = currentObject?.document?.media?.[schemaKey]?.find(
    (item: any) => item._id === defaultId
  );
  console.log("defaultValue", defaultValue);

  const [title, setTitle] = useState(defaultValue?.title || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    type === "image" ? defaultValue?.image : defaultValue?.video || null
  );
  const [base64String, setBase64String] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // const handleFileChange = useCallback(
  //   (event: React.ChangeEvent<HTMLInputElement>) => {
  //     const selectedFile = event.target.files?.[0];
      
  //     if (selectedFile) {
  //       if (selectedFile.size > MAX_FILE_SIZE * 1024 * 1024) {
  //         toast.error("File size exceeds the limit.");
  //         return;
  //       }
  //       setFile(selectedFile);

  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const result = reader.result as string;
  //         if(handleCropModal){
  //           handleCropModal(result, "field.name");
  //         }
  //         setPreview(result); // Set the preview for the image/video
  //         setBase64String(result); // Store the entire Base64 string including the MIME type
  //       };
  //       reader.readAsDataURL(selectedFile); // Converts file to Base64 string
  //     }
  //   },
  //   []
  // );
  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE * 1024 * 1024) {
          toast.error("File size exceeds the limit.");
          return;
        }
  
        const base64String = await convertToBase64(selectedFile);
  
        if (handleCropModal) {
          // Open the crop modal instead of directly setting the image
          handleCropModal(base64String, "field.name");
        } else {
          // If no modal, fall back to setting the preview and base64
          setFile(selectedFile);
          setPreview(base64String);
          setBase64String(base64String);
        }
      }
    },
    [handleCropModal]
  );
  

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > MAX_FILE_SIZE * 1024 * 1024) {
        toast.error("File size exceeds the limit.");
        return;
      }
      setFile(droppedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result); // Set the preview for the image/video
        setBase64String(result); // Store the entire Base64 string including the MIME type
      };
      reader.readAsDataURL(droppedFile); // Converts file to Base64 string
    }
  }, []);

  const handleDelete = useCallback(() => {
    setFile(null);
    setPreview(null);
    setBase64String(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!title || !file || !base64String) {
      toast.error("Please fill all the fields.");
      return;
    }
    if (file && title && base64String) {
      if (defaultId) {
        updateOrAddItem({
          document: {
            media: {
              [schemaKey]: [
                {
                  title,
                  [type]: base64String,
                  _id: defaultId,
                },
              ],
            },
          },
        });
        return;
      }
      updateOrAddItem({
        document: {
          media: {
            [schemaKey]: [
              {
                title,
                [type]: base64String, // Send the full Base64 string here
              },
            ],
          },
        },
      });
    }
  }, [file, title, base64String, updateOrAddItem]);

  const openFileDialog = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = () => {
    setTitle("");
    setFile(null);
    setPreview(null);
    setBase64String(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <GlobalDialog
      // title={type === "image" ? "Add Image" : "Add Video"}
      title={`Add ${titleH?.toLocaleLowerCase()}`}
      TriggerButton={children}
      onCancel={handleCancel}
      onConfirm={handleSave}
    >
      <Form>
      <div className="space-y-5">
        <div className="space-y-3">
          <Label
            htmlFor="title"
            className="text-[16px] font-normal leading-[19.2px]"
          >
            {type === "image" ? "Image title" : "Video title"}
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Enter ${type} title`}
          />
        </div>

        <div
          className="p-4 text-center border border-[#b5b5b5] border-dashed rounded-none cursor-pointer bg-[#f6f6f6]"
          onClick={openFileDialog}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="relative">
              {type === "image" ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-auto max-w-full"
                />
              ) : (
                <video src={preview} controls className="h-auto max-w-full" />
              )}
              <button
                onClick={handleDelete}
                className="absolute p-1 bg-white rounded-full top-2 right-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full p-6">
              {type === "image" ? (
                <img alt="" src="/images/uplaodImg.svg" />
              ) : (
                <svg
                  width="18"
                  height="22"
                  viewBox="0 0 18 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.25 1.92969V20.0697L16.05 10.3397L1.25 1.92969Z"
                    stroke="#1D1D1D"
                    stroke-width="1.2"
                    stroke-miterlimit="10"
                  />
                </svg>
              )}
              <p className="mb-1 mt-3 text-lg font-normal text-[#1D1D1D] leading-[25.2px] dark:text-gray-400">
                Drag and drop or browse files
              </p>
              <p className="text-sm leading-[16.8px] font-normal text-[#696969] dark:text-gray-400">
                {type === "image"
                  ? "Up to 20 MB, in .jpg, .webp, or .png format"
                  : "Up to 20 MB, in .MP4 format"}
              </p>
              {/* <Button variant="link" onClick={openFileDialog}>
                Browse Files
              </Button> */}
              <Input
                ref={fileInputRef}
                type="file"
                accept={type === "image" ? "image/*" : "video/*"}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
      </Form>
    </GlobalDialog>
  );
};

export default AddMedia;
