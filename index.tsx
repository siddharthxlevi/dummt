import React, { useCallback, useEffect, useRef, useState } from "react";
import { set, useForm, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Global/header/Header";
import { steps } from "./utils";
import SideBar from "./SideBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImagesStep from "./ImagesStep";
import DetailsStep from "./DetailStep";
import Location from "./Location";
import Provenance from "./Provenance";
import { useObjectContext } from "@/context/objects";
import Components from "./Components";
import ObjectIdentification from "./ObjectIdentification";
import SecondaryMeasurement from "./SecondaryMesaurement";
import Valuation from "./Valuation";
import Media from "./Media";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Shield,
} from "lucide-react";
import Global from "@/modal/Global";
import AddLocation from "./modal/AddLocation";
import Spinner from "@/components/Global/Spinner";
import AddProvenance from "./modal/Addprovenance";
import AddAuction from "./modal/AddAuction";
import AddExhibition from "./modal/Addexhibition";
import AddPublication from "./modal/AddPublication";
import AddComponents from "./modal/AddComponents";
import AddSecondaryMeasurement from "./modal/AddSecondaryMeasurement";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/context/user";
import useUserAPI from "@/apis/user";
import useFilter from "@/hooks/useFilter";
import { useDebouncedCallback } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import Records from "./Records";
import AddDocument from "./modal/AddDocument";
import AddValuation from "./modal/AddValuation";
import { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddingObjectsPopup from "./AddingObjectsPopup";
import CropImageModalPopup from "@/modal/CropImageModal";
import AddConditionReport from "./modal/AddConditionReport";

const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState("about");
  const [searchParams] = useSearchParams();
  const objectId = searchParams.get("oi");
  const isAsignProtectRequested = Boolean(
    searchParams.get("isAsignProtectRequested")
  );
  const { updateOrAddItem, currentObject, isLoading } = useObjectContext();
  const location = useLocation();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: currentObject,
  });
  const [success, setSuccess] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [cropImageName, setCropImageName] = useState("");
  const onSubmit = (data: any) => {
    try {
      setSuccess(false);
      updateOrAddItem(data);
      setSuccess(true);
    } catch (error) {
      setSuccess(false);
    }
    // Handle form submission
  };

  const combinedSteps = [...steps.information, ...steps.documentation]; // Combine all steps

  useEffect(() => {
    // Get the step from URL query parameter
    const searchParams = new URLSearchParams(location.search);
    const step = searchParams.get("step");
    if (step && combinedSteps.includes(step)) {
      setCurrentStep(step);
    }
  }, [location]);

  const handleImageCrop = (image: string, cropImageName: string) => {
    form.setValue(cropImageName, image);
    setIsCropModalOpen(false);
  };

  const handleCropModal = (base64String: string, name: string) => {
    setCropImageSrc(base64String);
    setCropImageName(name);
    setIsCropModalOpen(true);
  };

  // render component after IsCropModalOpen in useEffect
  useEffect(() => {}, [isCropModalOpen]);

  const updateQueryParams = (newStep: string) => {
    const searchParams = new URLSearchParams(location.search);

    // Update or add the "step" parameter
    searchParams.set("step", newStep);

    // Navigate while keeping the other parameters intact
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  const navigateSteps = (direction: "back" | "next") => {
    const currentIndex = combinedSteps.indexOf(currentStep);
    let newStep;

    if (direction === "back" && currentIndex > 0) {
      newStep = combinedSteps[currentIndex - 1];
    } else if (
      direction === "next" &&
      currentIndex < combinedSteps.length - 1
    ) {
      newStep = combinedSteps[currentIndex + 1];
    }

    if (newStep) {
      setCurrentStep(newStep);
      updateQueryParams(newStep);
    } else if (
      direction === "next" &&
      currentIndex === combinedSteps.length - 1 &&
      objectId
    ) {
      // No next step available, redirect to /catalog/detail/request if objectId is available
      navigate(`/catalog/asign/request?oi=${objectId}`);
    }
  };
  // console.log(currentStep);
  useEffect(() => {
    setSuccess(false);
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case "about":
        return <AboutStep isAsignProtectRequested={isAsignProtectRequested} />;
      case "images":
        return (
          <ImagesStep
            isAsignProtectRequested={isAsignProtectRequested}
            handleCropModal={handleCropModal}
          />
        );
      case "details":
        return (
          <DetailsStep isAsignProtectRequested={isAsignProtectRequested} />
        );
      case "location":
        return <Location isAsignProtectRequested={isAsignProtectRequested} />;
      case "provenance":
        return <Provenance />;
      case "components":
        return <Components />;
      case "object identification":
        return <ObjectIdentification />;
      case "secondary measurements":
        return <SecondaryMeasurement />;
      case "valuation":
        return <Valuation />;
      case "records":
        return <Records />;
      case "media":
        return <Media handleCropModal={handleCropModal}/>;
      default:
        return null;
    }
  };
  useEffect(() => {
    form.reset(currentObject);
  }, [currentObject]);
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container flex-col h-[92vh] font-normal font-sh5">
      <AddingObjectsPopup />
      <CropImageModalPopup
        openModal={isCropModalOpen}
        handleImageCrop={handleImageCrop}
        cropImageSrc={cropImageSrc}
        cropImageName={cropImageName}
      />
      <Header />
      <div className="flex flex-row w-full mq1000:flex-col lg:h-full">
        <div className="h-full overflow-y-scroll mq1000:w-full w-[35%] xl:w-[29%]">
          <SideBar
            currentStep={currentStep}
            setCurrentStep={(step) => {
              setCurrentStep(step);
              updateQueryParams(step);
            }}
          />
        </div>
        <div className="mq450:p-0 mq1000:px-0 mq1000:pt-0 lg:w-3/4 mq1000:bg-white bg-[#F6F6F6] px-12 pt-10 mq675:pb-16 mq1000:pb-20  ">
          <Form {...form}>
            <form className="flex flex-col h-full  bg-white rounded-none mq450:pb-16 pb-0 ">
              <div className="flex justify-between mq450:px-3 mq1000:px-11  px-5  mq450:py-[5.6px] py-[5.6px] border-b border-[#F2F2F2] border-solid">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigateSteps("back")}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium px-0"
                    // currentStep == "about" && "invisible"
                  )}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_2564_9049)">
                      <path
                        d="M13.9766 17.9165L6.02656 9.95817L13.9016 2.08317"
                        stroke="#1D1D1D"
                        stroke-miterlimit="10"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_2564_9049">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  BACK
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigateSteps("next")}
                  className="flex items-center gap-2 px-0 text-sm font-medium"
                >
                  NEXT
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_60_18724)">
                      <path
                        d="M6.02344 2.0835L13.9734 10.0418L6.09844 17.9168"
                        stroke="#1D1D1D"
                        stroke-miterlimit="10"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_60_18724">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </Button>
              </div>
              <div className="">
                <div className="overflow-y-auto flex-grow mq450:px-4 mq1000:px-12 py-10 mq1000:py-8 mq1000:h-[calc(100vh-323px)] h-[calc(100vh-228px)] px-[120px] relative">
                  <h2 className="mq1000:mb-8 mb-10 mq1000:text-[24px] mq1000:tracking-[-0.02em] mq1000:leading-[28.8px] leading-[33.6px] text-[28px] font-normal  text-[#1d1d1d]">
                    {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
                  </h2>
                  {renderStep()}
                  {success && (
                    <div className="w-3/4 py-3 pl-5 flex bg-[#E8FAF0] mx-auto gap-2 mt-2">
                      <div className="h-4 w-4">
                        <svg
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="0.5"
                            y="1"
                            width="15"
                            height="15"
                            rx="7.5"
                            stroke="#7AC51C"
                          />
                          <g clip-path="url(#clip0_60_18839)">
                            <path
                              d="M4.80469 7.87958L7.01469 10.0929L11.198 5.90625"
                              stroke="#7AC51C"
                              stroke-miterlimit="10"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_60_18839">
                              <rect
                                width="8"
                                height="8"
                                fill="white"
                                transform="translate(4 4)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <p className="leading-[16.8px] text-sm">
                        Saved successfully
                      </p>
                    </div>
                  )}
                  <div className="mq1000:mt-12 bottom-10 mq450:left-4 mq1000:left-12 mq1000:transform-none left-1/2 transform   mt-[29px] mb-[7px] flex items-center mq450:items-start mq450:justify-start justify-center text-sm font-normal text-[#696969] font-sh5">
                    Have questions?
                    <a href="https://www.asign.art/" target="_blank">
                      <span className="text-xs font-medium ml-[10px] underline-offset-2 underline text-[#1d1d1d]">
                        SEE KNOWLEDGE CENTER
                      </span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full px-5 py-4 border-t border-[#e5e5e5] mq1000:shadow-none shadow-[-6px_-6px_10px_0px_rgba(0,_0,_0,_0.05)] border-solid">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      navigate("/catalog/detail");
                    }}
                    className="px-[50px] h-[46px] py-2 text-sm font-medium rounded-full"
                  >
                    EXIT
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    type="button"
                    className="px-12 h-[46px]  py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800"
                  >
                    SAVE
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;

interface AboutStepProps {
  isAsignProtectRequested?: boolean;
}

const AboutStep: React.FC<AboutStepProps> = ({
  isAsignProtectRequested = false,
}) => {
  const form = useFormContext();
  console.log("form", form);
  const { eligibility, category } = useObjectContext();
  const { me } = useUserContext();
  const [name, setName] = useState(me?.artistName);
  form.watch(() => {
    setName(form.watch("artistName"));
  }, ["artist"]);
  // State initialization
  const [showCompletionYear, setShowCompletionYear] = useState(false);

  form.watch(() => {
    setShowCompletionYear(Boolean(form.watch("metaData.compeletionDate.year")));
  }, ["metaData.compeletionDate.year"]);

  // Constants
  const categories = [
    { name: "Painting", value: "painting" },
    { name: "Sculpture", value: "sculpture" },
    { name: "Photograph", value: "photograph" },
    { name: "Textile", value: "textile" },
    { name: "Ceramic", value: "ceramic" },
    { name: "Metal", value: "metal" },
    { name: "Glass", value: "glass" },
    { name: "Wood", value: "wood" },
    { name: "Other", value: "other" },
  ];

  // API and search setup
  const { searchUsers } = useUserAPI();
  const { filterOption, setQuery } = useFilter({
    options: { select: ["name", "id", "artistId"], pagination: false },
    query: {
      searchQuery: "",
      searchType: "regexSearch",
      userRole: "artist",
    },
  });

  // Memoized callbacks
  const querySearch = useDebouncedCallback((value) => {
    setQuery({ searchQuery: value === "" ? undefined : value });
  }, 1000);

  const handleArtistCheckbox = useCallback(
    (checked: boolean) => {
      form.setValue("artist", checked ? me?.id || "" : "");
      form.setValue("artistName", checked ? me?.name || "" : "");
    },
    [form, me]
  );

  const handleCircaChange = useCallback(
    (checked: boolean) => form.setValue("metaData.circa", checked),
    [form]
  );

  const handleUnknownDateChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        form.setValue("metaData.creationDate.year", "");
        form.setValue("metaData.creationDate.era", "");
        console.log("asdsa");
        form.setValue("metaData.circa", false);
      }
      form.setValue("metaData.isCreationDateUnknown", checked);
    },
    [form]
  );

  const toggleCompletionYear = useCallback(
    () => setShowCompletionYear(true),
    []
  );

  // Query setup
  const { data: artists, isLoading } = useQuery({
    queryKey: ["artist", filterOption],
    queryFn: () => searchUsers(filterOption),
    enabled: !!filterOption && filterOption.query?.searchQuery !== undefined,
  });

  // Character count calculation
  const getCharacterCount = useCallback(
    (value: string = "") => 3000 - value.length,
    []
  );
  const [isOpen, setIsOpen] = useState(false);

  const divRef = useRef<HTMLDivElement | null>(null);
  const [padding, setPadding] = useState("16px");
  useEffect(() => {
    const updatePadding = () => {
      if (divRef.current) {
        const divWidth = divRef.current.offsetWidth;
        if (divWidth > 600) {
          setPadding("8px");
        } else {
          setPadding("16px");
        }
      }
      console.log(padding);
    };

    // Call on mount and window resize
    updatePadding();
    window.addEventListener("resize", updatePadding);

    return () => {
      window.removeEventListener("resize", updatePadding);
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {!eligibility && category && (
        <div
          ref={divRef}
          className={`flex gap-3 bg-[#E8FAF0] mt-4`}
          style={{ padding }}
        >
          <div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_51_8204)">
                <path
                  d="M8.99297 2.33203L4.39297 10.532L2.29297 12.657L7.33464 17.7654L9.46797 15.632L17.493 10.9487L8.99297 2.33203Z"
                  stroke="#1D1D1D"
                  stroke-miterlimit="10"
                />
                <path
                  d="M4.39062 10.5352L9.19063 15.3935"
                  stroke="#1D1D1D"
                  stroke-miterlimit="10"
                />
                <path
                  d="M15.3508 2.05078L13.6758 3.72578"
                  stroke="#1D1D1D"
                  stroke-miterlimit="10"
                />
                <path
                  d="M18.007 4.68359L16.332 6.35859"
                  stroke="#1D1D1D"
                  stroke-miterlimit="10"
                />
              </g>
              <defs>
                <clipPath id="clip0_51_8204">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <p className="leading-[16.8px] text-[#1d1d1d]">
            Get Asign Protect+ by completing all the mandatory (
            <span className="text-red-500">*</span>) fields in this section.
          </p>
        </div>
      )}
      <div>
        <FormField
          control={form.control}
          name="artist"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={`${
                  isAsignProtectRequested
                    ? "after:content-['*'] after:ml-0.5 after:text-red-500"
                    : ""
                } pb-1`}
              >
                Artist's name
              </FormLabel>
              <FormControl className="relative w-full">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Input
                        className={`w-full  border border-solid px-3  h-[59px] outline-none  ${
                          isAsignProtectRequested && !form.watch("artistName")
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                        placeholder=""
                        type="text"
                        onChange={(e) => {
                          querySearch(e.target.value);
                          setName(e.target.value);
                          if (!isOpen) setIsOpen(true);
                        }}
                        value={name || ""}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 shadow-none rounded-none max-w-[55vw]"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <ScrollArea className=" border border-solid border-[#B5B5B5] translate-y-[-4px]">
                      <div className="max-h-96">
                        {isLoading
                          ? Array.from({ length: 8 }).map((_, index) => (
                              <Skeleton
                                key={index}
                                className="w-full h-5 mt-4"
                              />
                            ))
                          : artists?.data?.map((item) => (
                              <button
                                key={item.id}
                                className="w-full px-12 py-4 font-light text-left transition-colors font-sh5 hover:bg-gray-50 "
                                onClick={() => {
                                  field.onChange(item.id);
                                  form.setValue("artistName", item.name);
                                  setIsOpen(false);
                                }}
                              >
                                <span className="font-light capitalize">
                                  {item.name}
                                </span>
                              </button>
                            ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {me?.userRole === "artist" && (
          <div className="flex items-center gap-2 mt-3">
            <Checkbox
              checked={form.watch("artistName") === me?.name}
              onCheckedChange={handleArtistCheckbox}
              className="space-y-1 leading-none rounded-none border-[#1d1d1d] h-[19px] w-[19px]"
            />
            <p> I am the artist</p>
          </div>
        )}
      </div>
      <FormField
        control={form.control}
        name="objectName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required_field">Object title</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter a title or write ‘Untitled’"
                {...field}
                className={cn(
                  isAsignProtectRequested &&
                    !form.watch("objectName") &&
                    "border-red-500 placeholder:text-[#b5b5b5]"
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="descriptiveTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descriptive title</FormLabel>
            <FormControl>
              <Input {...field} maxLength={255} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required_field">Object type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger
                  className={cn(
                    isAsignProtectRequested &&
                      !field.value &&
                      "border-solid border-red-500 "
                  )}
                >
                  <SelectValue placeholder="Select object type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="shadow-none top-[-4px]  w-[99.8%]">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="metaData.creationDate.year"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required_field">Creation year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter year"
                  disabled={form.watch("metaData.isCreationDateUnknown")}
                  maxLength={4}
                  {...field}
                  className={cn(
                    isAsignProtectRequested &&
                      !field.value &&
                      !form.watch("metaData.isCreationDateUnknown") &&
                      "border-solid border-red-500 placeholder:text-[#b5b5b5]"
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metaData.creationDate.era"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required_field">Era</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={form.watch("metaData.isCreationDateUnknown")}
              >
                <FormControl>
                  <SelectTrigger
                    className={cn(
                      "disabled:text-[#b5b5b5] disabled:opacity-100",
                      isAsignProtectRequested &&
                        !field.value &&
                        !form.watch("metaData.isCreationDateUnknown") &&
                        "border-solid border-red-500 text-[#b5b5b5]"
                    )}
                  >
                    <SelectValue
                      placeholder="Select era"
                      className="text-[#b5b5b5] opacity-100"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className=" top-[-4px] w-[99.8%] shadow-none">
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="BCE">BCE</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* see later */}
      <div className="flex gap-x-6 mq450:justify-between mt-[-20px]">
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="metaData.circa"
            checked={form.watch("metaData.circa")}
            onCheckedChange={handleCircaChange}
            disabled={form.watch("metaData.isCreationDateUnknown")}
            className="rounded-none h-5 w-5 border-[#1d1d1d]"
          />
          <label htmlFor="metaData.circa" className="text-sm ">
            Circa
          </label>
        </div>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="metaData.isCreationDateUnknown"
            checked={form.watch("metaData.isCreationDateUnknown")}
            onCheckedChange={handleUnknownDateChange}
            className="rounded-none h-5 w-5 border-[#1d1d1d]"
          />
          <label htmlFor="metaData.isCreationDateUnknown" className="text-sm ">
            Object creation date is unknown.
          </label>
        </div>
      </div>

      {!showCompletionYear ? (
        <Button
          type="button"
          variant="link"
          className="justify-start w-auto h-auto p-0 items-center text-[#1d1d1d] rounded-none max-w-[170px] mt-[-8px]"
          onClick={toggleCompletionYear}
        >
          <div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_2615_11153)">
                <path
                  d="M10 2.00195V18.002"
                  stroke="#1D1D1D"
                  stroke-miterlimit="10"
                />
                <path
                  d="M2 10.0059H17.9991"
                  stroke="#1D1D1D"
                  stroke-miterlimit="10"
                />
              </g>
              <defs>
                <clipPath id="clip0_2615_11153">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <span className="border-b border-solid ml-1 font-medium">
            ADD COMPLETION YEAR
          </span>
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="metaData.compeletionDate.year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Completion year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter year"
                    {...field}
                    max={4}
                    className="placeholder:text-[#b5b5b5]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metaData.compeletionDate.era"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Era</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-[#b5b5b5]">
                      <SelectValue placeholder="Select era" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="BCE">BCE</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-x-6 mq450:justify-between mt-[-2px]">
            <div className="flex items-center gap-x-2">
              <Checkbox
                id="metaData.circa"
                // checked={form.watch("metaData.circa")}
                // onCheckedChange={handleCircaChange}
                // disabled={form.watch("metaData.isCreationDateUnknown")}
                className="rounded-none h-5 w-5 border-[#1d1d1d]"
              />
              <label htmlFor="metaData.circa" className="text-sm ">
                Circa
              </label>
            </div>
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="objectInpossession"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="required_field">
              Is the object in your possession?
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={String(field.value)}
                className="flex flex-col gap-y-0"
              >
                <FormItem
                  className={cn(
                    "flex items-center p-4 space-x-4 space-y-0 border border-solid border-bdr-10",
                    isAsignProtectRequested &&
                      field == undefined &&
                      "border-red-500"
                  )}
                >
                  <FormControl>
                    <RadioGroupItem value="true" className=" h-6 w-6" />
                  </FormControl>
                  <FormLabel>YES</FormLabel>
                </FormItem>
                <FormItem
                  className={cn(
                    "flex items-center p-4 space-x-4 space-y-0 border border-solid border-bdr-10",
                    isAsignProtectRequested &&
                      field == undefined &&
                      "border-red-500"
                  )}
                >
                  <FormControl>
                    <RadioGroupItem value="false" className=" h-6 w-6" />
                  </FormControl>
                  <FormLabel>NO</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Object description</FormLabel>
            <FormControl>
              <Textarea
                placeholder=""
                className="rounded-none p-0 resize-none h-[119px]"
                maxLength={3000}
                {...field}
              />
            </FormControl>
            <FormDescription>
              {getCharacterCount(field.value)} characters left
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

interface ActionDropDownProps {
  id: string;
  dataKey: string;
  downloadLink?: string;
}

export const createNestedObject = (key: string, value: any) => {
  return key.split(".").reduceRight((acc, part) => ({ [part]: acc }), value);
};

export const ActionDropDown: React.FC<ActionDropDownProps> = ({
  id,
  dataKey,
  downloadLink,
}) => {
  const { updateOrAddItem } = useObjectContext();
  const popoverRef = useRef<HTMLDivElement>(null);

  const onDelete = (id: string) => {
    // Use the helper function to create a nested object
    const payload = createNestedObject(dataKey, [
      {
        _id: id,
        delete: true,
      },
    ]);

    // Update the object using the payload
    updateOrAddItem(payload);
  };

  useEffect(() => {
    if (popoverRef.current) {
      popoverRef.current.focus();
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none" type="button">
          <div className="w-5 h-5 text-gray-500">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_2831_27887)">
                <path
                  d="M12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5Z"
                  stroke="#CFCFCF"
                  stroke-width="0.5"
                  stroke-miterlimit="10"
                />
                <path
                  d="M12.0312 12.7793C12.4455 12.7793 12.7812 12.4435 12.7812 12.0293C12.7812 11.6151 12.4455 11.2793 12.0312 11.2793C11.617 11.2793 11.2812 11.6151 11.2812 12.0293C11.2812 12.4435 11.617 12.7793 12.0312 12.7793Z"
                  fill="#1D1D1D"
                />
                <path
                  d="M7.9707 12.7793C8.38492 12.7793 8.7207 12.4435 8.7207 12.0293C8.7207 11.6151 8.38492 11.2793 7.9707 11.2793C7.55649 11.2793 7.2207 11.6151 7.2207 12.0293C7.2207 12.4435 7.55649 12.7793 7.9707 12.7793Z"
                  fill="#1D1D1D"
                />
                <path
                  d="M16.0293 12.7793C16.4435 12.7793 16.7793 12.4435 16.7793 12.0293C16.7793 11.6151 16.4435 11.2793 16.0293 11.2793C15.6151 11.2793 15.2793 11.6151 15.2793 12.0293C15.2793 12.4435 15.6151 12.7793 16.0293 12.7793Z"
                  fill="#1D1D1D"
                />
              </g>
              <defs>
                <clipPath id="clip0_2831_27887">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-6 font-normal border border-gray-200 rounded-md  shadow-lg font-sh5"
        align="end"
        ref={popoverRef}
        tabIndex={0}
      >
        <div className="py-2 space-y-5">
          {/* Conditionally render the Edit button based on dataKey */}
          {dataKey === "provenance.overview" && (
            <AddProvenance defaultId={id}>
              <button className="w-full font-normal text-left" type="button">
                Edit
              </button>
            </AddProvenance>
          )}
          {dataKey === "provenance.auctionHistory" && (
            <AddAuction defaultId={id}>
              <button className="w-full font-normal text-left" type="button">
                Edit
              </button>
            </AddAuction>
          )}
          {dataKey === "provenance.exhibitionHistory" && (
            <AddExhibition defaultId={id}>
              <button className="w-full font-normal text-left" type="button">
                Edit
              </button>
            </AddExhibition>
          )}
          {dataKey === "provenance.publicationHistory" && (
            <AddPublication defaultId={id}>
              <button className="w-full font-normal text-left" type="button">
                Edit
              </button>
            </AddPublication>
          )}
          {dataKey === "components" && (
            <AddComponents defaultId={id}>
              <button className="w-full font-normal text-left" type="button">
                Edit
              </button>
            </AddComponents>
          )}
          {dataKey === "document.secondaryMeasurements" && (
            <AddSecondaryMeasurement defaultId={id}>
              <button className="w-full font-normal text-left" type="button">
                Edit
              </button>
            </AddSecondaryMeasurement>
          )}
          {dataKey === "document.records.document" && (
            <>
              {/* <button
                className="w-full font-normal text-left"
                type="button"
                onClick={() => {
                  const fileName = downloadLink?.split("/").pop()
                  const link = document.createElement("a");
                  link.href = downloadLink || "";
                  link.setAttribute("download", fileName|| "file.pdf");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download
              </button> */}
              <Link to={downloadLink || ""} target="_blank" download>Download</Link>


              <AddDocument defaultId={id}>
                <button className="w-full font-normal text-left" type="button">
                  Edit
                </button>
              </AddDocument>
            </>
          )}
          {dataKey === "document.records.conditionReport" && (
            <>
              {/* <button
                className="w-full font-normal text-left"
                type="button"
                onClick={() => {
                  const fileName = downloadLink?.split("/").pop()
                  const link = document.createElement("a");
                  link.href = downloadLink || "";
                  link.setAttribute("download", fileName|| "file.pdf");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download
              </button> */}
              <Link to={downloadLink || ""} target="_blank" download>Download</Link>


              <AddConditionReport defaultId={id}>
                <button className="w-full font-normal text-left" type="button">
                  Edit
                </button>
              </AddConditionReport>
            </>
          )}
          {dataKey === "document.valuation.valuationDetail" && (
            <AddValuation defaultId={id}>
              <button className="w-full font-normal text-left" type="button">
                Edit
              </button>
            </AddValuation>
          )}
          {/* You can add more conditions for other dataKeys as needed */}
          <Global
            title="Delete"
            description="Are you sure you want to permanently delete?"
            actionText="DELETE"
            cancelText="CANCEL"
            onConfirm={() => onDelete(id)}
          >
            <button className="w-full font-normal text-left " type="button">
              Delete
            </button>
          </Global>
        </div>
      </PopoverContent>
    </Popover>
  );
};
