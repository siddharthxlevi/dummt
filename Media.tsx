"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LockIcon, PlusIcon } from "lucide-react";
import AddMedia from "./modal/AddMedia";
import { useObjectContext } from "@/context/objects";
import ReactPlayer from "react-player";
import Slider from "react-slick";
import Image from "../../components/Global/Image";
import { PlayVideo } from "@/components/Preview/DiscoverPreview";
import Global from "@/modal/Global";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { createNestedObject } from ".";

interface MediaDropDownProps {
  item: any;
  isVideo: boolean;
  scehmaKey: any;
  title: string;
}

export const createNestedObject = (key: string, value: any) => {
  return key.split(".").reduceRight((acc, part) => ({ [part]: acc }), value);
};

export const MediaDropDown: React.FC<MediaDropDownProps> = ({
  item,
  isVideo,
  scehmaKey,
  title,
}) => {
  const { updateOrAddItem } = useObjectContext();
  const popoverRef = useRef<HTMLDivElement>(null);

  const onDelete = (id: string) => {
    updateOrAddItem({
      document: {
        media: {
          [scehmaKey]: [
            {
              _id: id,
              delete: true,
            },
          ],
        },
      },
    });
  };

  useEffect(() => {
    if (popoverRef.current) {
      popoverRef.current.focus();
    }
  }, []);
  // console.log("item", item);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none" type="button">
          <div className="w-5 h-5 ">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.8"
                y="0.8"
                width="22.4"
                height="22.4"
                rx="11.2"
                fill="#F2F2F2"
              />
              <rect
                x="0.8"
                y="0.8"
                width="22.4"
                height="22.4"
                rx="11.2"
                stroke="white"
                stroke-width="1.6"
              />
              <path
                d="M10.5 7C10.5 7.82843 11.1716 8.5 12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7Z"
                stroke="#1D1D1D"
                stroke-miterlimit="10"
              />
              <path
                d="M10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12Z"
                stroke="#1D1D1D"
                stroke-miterlimit="10"
              />
              <path
                d="M10.5 17C10.5 17.8284 11.1716 18.5 12 18.5C12.8284 18.5 13.5 17.8284 13.5 17C13.5 16.1716 12.8284 15.5 12 15.5C11.1716 15.5 10.5 16.1716 10.5 17Z"
                stroke="#1D1D1D"
                stroke-miterlimit="10"
              />
            </svg>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-6 font-normal border rounded-none border-gray-200 shadow-lg font-sh5"
        align="end"
        ref={popoverRef}
        tabIndex={0}
      >
        <div className="py-2 space-y-5">
          <AddMedia
            type={isVideo ? "video" : "image"}
            titleH={title}
            schemaKey={scehmaKey ?? ""}
            defaultId={item._id}
          >
            <button className="w-full font-normal text-left" type="button">
              Edit
            </button>
          </AddMedia>

          <Global
            title="Delete"
            description="Are you sure you want to permanently delete?"
            actionText="DELETE"
            cancelText="CANCEL"
            onConfirm={() => onDelete(item._id)}
          >
            <button className="w-full font-normal text-left " type="button">
              Delete
            </button>
          </Global>
          <button
            className="w-full font-normal text-left"
            type="button"
            onClick={() => {
              const downloadUrl = isVideo ? item.video : item.image;

              const link = document.createElement("a");
              link.href = downloadUrl;

              const filename = downloadUrl.substring(
                downloadUrl.lastIndexOf("/") + 1
              );
              link.download = filename || "download";

              link.style.display = "none";
              document.body.appendChild(link);

              link.click();

              document.body.removeChild(link);
            }}
          >
            Download
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface MediaSectionProps {
  title: string;
  helperText: string;
  addButtonText: string;
  handleCropModal?: (base64String: string, name: string) => void;
  items?: Array<{
    image?: string;
    video?: string;
    title?: string;
    _id: string;
  }>; // Updated type to handle both image and video
  isLocked?: boolean;
  isVideo?: boolean;
  scehmaKey?: string;
}

const MediaSection: React.FC<MediaSectionProps> = ({
  title,
  helperText,
  addButtonText,
  items = [],
  handleCropModal,
  isLocked = false,
  isVideo = false,
  scehmaKey,
}) => {
  const sliderRef = useRef<Slider | null>(null);

  const next = () => {
    sliderRef.current?.slickNext();
  };

  const previous = () => {
    sliderRef.current?.slickPrev();
  };
  const containerRef = useRef(null);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const updateSlidesToShow = (width: number) => {
    if (width >= 1024) {
      setSlidesToShow(4);
    } else if (width >= 700) {
      setSlidesToShow(4);
    } else if (width >= 520) {
      setSlidesToShow(3);
    } else {
      setSlidesToShow(2);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        updateSlidesToShow(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  const adjustedItems =
    items.length > 0 && items.length < slidesToShow
      ? [
          ...items,
          ...Array.from({ length: slidesToShow - items.length }, () => ({
            image:
              "https://coolbackgrounds.io/images/backgrounds/white/pure-white-background-85a2a7fd.jpg",
            video: "",
            title: "Placeholder",
            _id: "123",
          })),
        ]
      : items;

  let dragging = false;
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: () => (dragging = true),
    afterChange: () => (dragging = false),
  };
  console.log(items);

  return (
    <div className="mb-5 " ref={containerRef}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[20px] font-normal leading-[24px]">{title}</h2>
        {adjustedItems.length > 0 && (
          <div className="flex flex-row items-center gap-[24px]">
            {[true, false].map((flip, index) => (
              <svg
                key={index}
                className={`p-[3px] rounded-full h-[20px] w-[20px] cursor-pointer ${
                  flip ? "text-gray-500" : ""
                }`}
                onClick={flip ? previous : next}
                style={flip ? { transform: "rotate(180deg)" } : {}}
                width="9"
                height="14"
                viewBox="0 0 9 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.15234 1.00293L7.14677 7.00849L1.14121 13.0029"
                  stroke={flip ? "#696969" : "#1D1D1D"}
                  strokeWidth="1.5"
                />
              </svg>
            ))}
          </div>
        )}
      </div>

      {adjustedItems.length === 0 ? (
        <p className="text-sm text-gray-500 mt-[-12px]">
          You have not added any {helperText.toLowerCase()} yet.
        </p>
      ) : (
        <Slider {...settings} ref={sliderRef} className="w-full">
          {adjustedItems.map((item, index) => (
            <div key={index} className="pr-6 w-full">
              <Card className="shadow-none">
                <CardContent className="p-0 shadow-none relative">
                  {isVideo && item.video ? (
                    item.video !== "" ? (
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/commons/5/50/Black_colour.jpg"
                          alt={`Video thumbnail for ${item.title || "Media"}`}
                          className="block object-cover w-full h-full rounded-none"
                        />
                        <PlayVideo
                          url={item.video}
                          title={item.title || "video"}
                        >
                          <div className="absolute top-0 left-0 w-full h-full cursor-pointer">
                            <div className="absolute top-1/2 left-1/2 h-[32px] w-[32px] -translate-x-1/2 -translate-y-1/2">
                              {/* <img
                                src="/play.svg"
                                alt="Play Button"
                                className="absolute w-4 h-4"
                              /> */}
                                <svg
                                  width="32"
                                  height="32"
                                  viewBox="0 0 32 32"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g clip-path="url(#clip0_60_25045)">
                                    <rect
                                      width="32"
                                      height="32"
                                      rx="16"
                                      fill="white"
                                    />
                                    <path
                                      d="M13 10V22L21 15.5634L13 10Z"
                                      fill="#1D1D1D"
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_60_25045">
                                      <rect
                                        width="32"
                                        height="32"
                                        rx="16"
                                        fill="white"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                            </div>
                          </div>
                        </PlayVideo>
                      </div>
                    ) : (
                      <div></div>
                    )
                  ) : (
                    <div className="relative aspect-[4/3] w-full">
                      <img
                        src={item?.image}
                        alt={`${item?.title || "Media"} ${index + 1}`}
                        className="w-full h-full object-cover rounded-none"
                      />
                    </div>
                  )}
                  {item._id !== "123" && (
                    <div className="absolute right-3 bottom-1">
                      <MediaDropDown
                        item={item}
                        isVideo={isVideo}
                        title={title}
                        scehmaKey={scehmaKey}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </Slider>
      )}

      {!isLocked && (
        <div className="mt-8">
          <AddMedia
            type={isVideo ? "video" : "image"}
            titleH={title}
            schemaKey={scehmaKey ?? ""}
            handleCropModal={handleCropModal}
          >
            <Button
              variant="link"
              className="justify-start w-full h-auto p-0 mt-0 uppercase hover:no-underline"
            >
              <div className="flex gap-1 items-center ">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.001 2.00195V18.002"
                    stroke="#1D1D1D"
                    stroke-miterlimit="10"
                  />
                  <path
                    d="M2.00098 10.0059H18"
                    stroke="#1D1D1D"
                    stroke-miterlimit="10"
                  />
                </svg>
                <span className="text-[14px] leading-[11.2px] font-medium underline underline-offset-[6px] uppercase  mq1000:text-[12px] mq1000:leading-[80%]">
                  {addButtonText}
                </span>
              </div>
            </Button>
          </AddMedia>
        </div>
      )}
    </div>
  );
};

interface MediaProps {
  isAsignProtectRequested?: boolean;
  handleCropModal?: (base64String: string, name: string) => void;
}
const Media: React.FC<MediaProps> = ({ handleCropModal }) => {
  const asignProtectImages = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TECvErw8vHOslzH9wKWzjNYcR6tJIZ.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1niag1MT55U46Z5kolRMMz83FpLx42.png",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-J6mI0aCZ1gTI4YWBYa6fISptS6U0oQ.png",
  ];
  const { currentObject } = useObjectContext();
  return (
    <div className="max-w-4xl mx-auto">
      <div className="border-b border-solid border-[#e5e5e5] mb-10">
        <MediaSection
          title="Additional object images"
          helperText="images"
          addButtonText="ADD IMAGE"
          handleCropModal={handleCropModal}
          items={currentObject?.document?.media?.addtionImages}
          scehmaKey="addtionImages"
        />
      </div>
      <div className="border-b border-solid border-[#e5e5e5] mb-10">
        <MediaSection
          title="Object videos"
          helperText="videos"
          addButtonText="ADD VIDEO"
          isVideo
          scehmaKey="videos"
          items={currentObject?.document?.media?.videos}
        />
      </div>
      <div className="">
        <div className="mb-6">
          <div className="flex gap-2">
            <h2 className="text-[24px] leading-[28.8px] font-normal mb-1">
              Object archives
            </h2>
            <svg
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_60_24669)">
                <path
                  d="M19.5 10.0098H4.5V21.9998H19.5V10.0098Z"
                  stroke="black"
                  stroke-miterlimit="10"
                />
                <path
                  d="M12 3C12.9283 3 13.8185 3.36875 14.4749 4.02513C15.1313 4.6815 15.5 5.57174 15.5 6.5V9.99H8.5V6.5C8.5 5.57174 8.86875 4.6815 9.52513 4.02513C10.1815 3.36875 11.0717 3 12 3Z"
                  stroke="black"
                  stroke-miterlimit="10"
                />
                <path
                  d="M12 13.4902V18.5202"
                  stroke="black"
                  stroke-miterlimit="10"
                />
              </g>
              <defs>
                <clipPath id="clip0_60_24669">
                  <rect
                    width="24"
                    height="24"
                    fill="white"
                    transform="translate(0 0.5)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
          <p className="text-[14px] leading-[16.8px] text-gray-60">
            This is only for your personal records and will never be <br />{" "}
            public.
          </p>
        </div>
      </div>
      <div className="border-b border-solid border-[#e5e5e5] mb-10">
        <MediaSection
          title="Archival images"
          helperText="images"
          addButtonText="ADD IMAGE"
          handleCropModal={handleCropModal}
          scehmaKey="archivedImage"
          items={currentObject?.document?.media?.archivedImage}
        />
      </div>
      <div className="border-b border-solid border-[#e5e5e5] mb-10">
        <MediaSection
          title="Archival videos"
          helperText="videos"
          addButtonText="ADD VIDEO"
          isVideo
          scehmaKey="archivedVideos"
          items={currentObject?.document?.media?.archivedVideos}
        />
      </div>

      <div className="mb-8">
        <div className="flex justify-between">
          <h2 className="mb-1 text-[20px] font-normal leading-[24px]">
            Asign Protect+ images
          </h2>
          <div className="flex flex-row items-center gap-[24px]">
            {[true, false].map((flip, index) => (
              <svg
                key={index}
                className={`p-[3px] rounded-full h-[20px] w-[20px] cursor-pointer ${
                  flip ? "text-gray-500" : ""
                }`}
                style={flip ? { transform: "rotate(180deg)" } : {}}
                width="9"
                height="14"
                viewBox="0 0 9 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.15234 1.00293L7.14677 7.00849L1.14121 13.0029"
                  stroke={flip ? "#696969" : "#1D1D1D"}
                  strokeWidth="1.5"
                />
              </svg>
            ))}
          </div>
        </div>
        <p className="mb-5 text-sm leading-[16.8px] text-gray-500">
          These images will be uploaded by Asign. Current images are <br /> for
          representation purposes only.
        </p>
        <ScrollArea className="w-full border rounded-none whitespace-nowrap">
          <div className="flex p-0 space-x-6 w-max">
            {/* {asignProtectImages.map((image, index) => (
              <Card key={index} className=" rounded-none">
                <CardContent className="p-0">
                  <img
                    src={image}
                    alt={`Asign Protect+ image ${index + 1}`}
                    className="w-[162px] h-[120px] object-cover rounded-none"
                  />
                </CardContent>
              </Card>
            ))} */}
            <Card className=" rounded-none overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={"/asign_protect_plus.png"}
                  alt={`Asign Protect+ image`}
                  className="w-[162px] h-[120px] object-cover rounded-none scale-[150%] translate-y-1"
                />
              </CardContent>
            </Card>
            <Card className=" rounded-none overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={"/asign_protect_plus.png"}
                  alt={`Asign Protect+ image`}
                  className="w-[162px] h-[120px] object-cover rounded-none scale-[180%] translate-y-7 -translate-x-6"
                />
              </CardContent>
            </Card>
            <Card className=" rounded-none overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={"/asign_protect_plus.png"}
                  alt={`Asign Protect+ image`}
                  className="w-[162px] h-[120px] object-cover rounded-none scale-[150%] translate-y-7"
                />
              </CardContent>
            </Card>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default Media;
