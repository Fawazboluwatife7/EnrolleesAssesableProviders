import React, { useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CgLogOut } from "react-icons/cg";
import { RxPerson } from "react-icons/rx";
import { CgPlayTrackNext } from "react-icons/cg";
import { MdSkipPrevious } from "react-icons/md";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BsSearch } from "react-icons/bs";

const Homepage = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [title, setTitle] = useState([]);
    const [marital, setMarital] = useState([]);
    const [company, setCompany] = useState([]);
    const [scheme, setScheme] = useState([]);
    const [gender, setGender] = useState([]);
    const [lga, setLga] = useState([]);
    const [searchProviders, setSearchProviders] = useState("");
    const [searchClicked, setSearchClicked] = useState(false);
    const [enrolleeExists, setEnrolleeExists] = useState(true);

    const [selectedState, setState] = useState({
        Text: "",
        Value: "",
    });
    const [selectedLga, setSelectedLga] = useState({
        Text: "",
        Value: "",
    });
    const [apiSuccessModal, setApiSuccessModal] = useState(false);
    const [allResponses, setAllResponses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [enrolleeData, setEnrolleeData] = useState({
        uniqueMembershipNo: "",
    });

    const [bioData, setBiodata] = useState("");
    const [errorModal, setErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [users, setUser] = useState("");
    const [state, SetStates] = useState([]);
    const [enrolleeId, setEnrolleeId] = useState("");
    const [isLoading, setisLoading] = useState(false);
    const [FilteredProviders, setFilteredProviders] = useState([]);

    const handleEnroleeeInputChange = (e) => {
        setEnrolleeId(e.target.value);
    };
    function DateDropdown({
        options,
        selectedValue,
        sendSelection,
        className,
    }) {
        const handleChange = (event) => {
            const value = event.target.value;
            const selectedOption = options.find(
                (option) => option.value === value,
            );

            // Send both value and label
            if (selectedOption) {
                sendSelection(selectedOption);
            }
        };

        return (
            <select
                value={selectedValue?.value || ""} // Ensure it doesn't break if null
                onChange={handleChange}
                className={`border border-gray-300 rounded p-2 ${className}`}
            >
                <option value="" disabled>
                    Select Type
                </option>
                {options.map((option, index) => (
                    <option
                        key={`${option.value}-${index}`}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    useEffect(() => {
        GetStates();
    }, []);

    useEffect(() => {
        if (selectedState.value) GetLGA();
    }, [selectedState.value]);

    const handleSearch = (e) => {
        setSearchProviders(e.target.value);
    };
    useEffect(() => {
        if (selectedLga.Value) GetFilteredProviders();
    }, [selectedLga.Value]);
    async function GetStates() {
        try {
            const states = await fetch(`${apiUrl}api/ListValues/GetStates`, {
                method: "GET",
            });
            const response = await states.json();
            console.log("states", response);
            SetStates(response);
        } catch (error) {
            console.error("Error fetching states", error);
        }
    }

    //Read later

    async function GetFilteredProviders() {
        setSearchClicked(true);
        setisLoading(true);

        try {
            const providers = await fetch(
                `${apiUrl}api/ListValues/GetProviderswithoutpharmacy?schemeid=0&MinimumID=0&NoOfRecords=10000&pageSize=1000&ProviderName=&TypeID=0&StateID=${selectedState.value}&LGAID=${selectedLga.value}&enrolleeid=${enrolleeId}&provider_id=0`,
                {
                    method: "GET",
                },
            );

            const apiResponse = await providers.json();
            console.log("providers", apiResponse);
            setFilteredProviders(apiResponse.result);
        } catch (error) {
            console.error("Error fetching filtered providers", error);
        } finally {
            setisLoading(false);
        }
    }

    async function GetLGA() {
        try {
            const lga = await fetch(
                `${apiUrl}api/ListValues/GetCitiesByStates?state=${selectedState.value}`,
                {
                    method: "GET",
                },
            );

            const response = await lga.json();
            console.log("Lga", response);
            setLga(response);
        } catch (error) {
            console.error("Error fetching lga", error);
        }
    }

    useEffect(() => {
        if (enrolleeData != null) {
            GetEnrolleeBiodata(enrolleeData);
        }
    }, [enrolleeData]);

    async function GetEnrolleeBiodata(enrolleeData) {
        try {
            const response = await fetch(
                `${apiUrl}api/EnrolleeProfile/GetEnrolleeBioDataByEnrolleeID?enrolleeid=${enrolleeData}`,
                {
                    method: "GET",
                },
            );

            const data = await response.json();

            console.log("biodata", data.result[0].Member_ParentMemberUniqueID);

            setBiodata(data.result[0].Member_ParentMemberUniqueID);
        } catch (error) {
            console.error("get title:", error);
        }
    }

    useEffect(() => {
        if (selectedGroupId) {
            GetCompanyScheme(selectedGroupId); // only called when selectedGroupId is set
        }
    }, [selectedGroupId]);

    async function GetCompanyScheme(groupId) {
        try {
            const response = await fetch(
                `${apiUrl}api/CorporateProfile/GetClientProfiledPlans?group_id=${groupId}`,
                {
                    method: "GET",
                },
            );

            const data = await response.json();
            console.log("scheme", data);
            setScheme(data.result);
        } catch (error) {
            console.error("get Marital:", error);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];

                setFormData((prev) => ({
                    ...prev,
                    passport: {
                        name: file.name,
                        base64: base64String,
                        type: file.type,
                    },
                }));
            };

            reader.readAsDataURL(file);
        }
    };

    const handleDeleteDependant = (indexToRemove) => {
        setDependants((prev) =>
            prev.filter((_, index) => index !== indexToRemove),
        );
    };

    const handleDependantFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result.split(",")[1];
            setDependantData((prev) => ({
                ...prev,
                passport: {
                    name: file.name,
                    type: file.type,
                    base64: base64String,
                },
            }));
        };
        reader.readAsDataURL(file);
    };

    function logout() {
        navigate("/");
        localStorage.clear();
    }

    const handleDependantChange = (e) => {
        const { name, value } = e.target;
        setDependantData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDependantImage = (e) => {
        setDependantData((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", { ...formData, dependants });
        // Add your form submission logic here
    };

    const handleFullSubmission = async () => {
        await Submit(); // first submit enrollee
        // The enrolleeData and bioData updates will trigger the useEffect to handle dependants
    };

    const handleCompanySearchChange = (value) => {
        setCompanySearch(value);
        if (value.trim() === "") {
            setFilteredCompanies([]);
            return;
        }
        const results = company.filter((c) =>
            c.GROUP_NAME.toLowerCase().includes(value.toLowerCase()),
        );
        setFilteredCompanies(results);
    };

    const handleCompanySelect = (selectedCompany) => {
        setFormData({ ...formData, company: selectedCompany.GROUP_ID });
        setSelectedGroupId(selectedCompany.GROUP_ID);
        setCompanySearch(selectedCompany.GROUP_NAME);
        setFilteredCompanies([]);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // const filteredData = searchProviders
    //     ? FilteredProviders.filter(
    //           (item) =>
    //               item.FullName?.toLowerCase().includes(searchProviders) ||
    //               item.provider?.toLowerCase().includes(searchProviders) ||
    //               item.Specialty?.toLowerCase().includes(searchProviders) ||
    //               item.Discipline?.toLowerCase().includes(searchProviders) ||
    //               item.add1?.toLowerCase().includes(searchProviders) ||
    //               item.ProviderAddress?.toLowerCase().includes(searchProviders),
    //       )
    //     : FilteredProviders;

    const filteredData = searchProviders
        ? FilteredProviders.filter(
              (item) =>
                  (item.FullName || item.provider || "")
                      .toLowerCase()
                      .includes(searchProviders.toLowerCase()) ||
                  (item.Specialty || item.Discipline || "")
                      .toLowerCase()
                      .includes(searchProviders.toLowerCase()) ||
                  (item.add1 || item.ProviderAddress || "")
                      .toLowerCase()
                      .includes(searchProviders.toLowerCase()),
          )
        : FilteredProviders;

    // const sortedProviders = [...filteredData].sort((a, b) => {
    //     const nameA = (a.FullName || a.provider || "").toLowerCase();
    //     const nameB = (b.FullName || b.provider || "").toLowerCase();
    //     return nameA.localeCompare(nameB);
    // });

    const sortedProviders = [...filteredData].sort((a, b) => {
        const nameA = (a.FullName || a.provider || "").trim().toLowerCase();
        const nameB = (b.FullName || b.provider || "").trim().toLowerCase();

        const startsWithNumber = (str) => /^\d/.test(str);

        const isNumberA = startsWithNumber(nameA);
        const isNumberB = startsWithNumber(nameB);

        if (isNumberA && !isNumberB) return 1; // Put A after B
        if (!isNumberA && isNumberB) return -1; // Put A before B

        return nameA.localeCompare(nameB);
    });

    const totalPages = Math.ceil(sortedProviders?.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const uniqueProviders = sortedProviders.filter(
        (provider, index, self) =>
            index ===
            self.findIndex((p) => p.ProviderID === provider.ProviderID),
    );

    const paginatedResults = uniqueProviders?.slice(startIndex, endIndex);

    const [enrolleeBioData, SetEnrolleeBioData] = useState([]);
    const [enrolleeUserName, setEnrolleeUserName] = useState([]);

    useEffect(() => {
        if (enrolleeId) {
            SearchEnrolleeBiodata();
        }
    }, [enrolleeId]);

    async function SearchEnrolleeBiodata() {
        setSearchClicked(true);
        try {
            const numbs = `${apiUrl}api/EnrolleeProfile/GetEnrolleeBioDataByEnrolleeID?enrolleeid=${enrolleeId}`;
            console.log("numbs", numbs);
            const response = await fetch(
                `${apiUrl}api/EnrolleeProfile/GetEnrolleeBioDataByEnrolleeID?enrolleeid=${enrolleeId}`,
                {
                    method: "GET",
                },
            );
            const data = await response.json();
            console.log("enrolleeEmail", data.result[0].Member_CustomerName);

            const email = data.result[0].Member_EmailAddress_One;
            if (!email) {
                setErrorModal(true);
            }

            if (data.result[0].Member_CustomerName.length > 0) {
                setEnrolleeUserName(data.result[0].Member_CustomerName);
                setEnrolleeExists(true);
            } else {
                setEnrolleeUserName(null);
                setEnrolleeExists(false);
            }

            SetEnrolleeBioData(data.result[0].Member_EmailAddress_One);
        } catch (error) {
            console.error("Error fetching enrollees:", error);
            setEnrollees([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (enrolleeUserName) {
            SearchEnrolleeProviders();
        }
    }, [enrolleeUserName]);

    async function SearchEnrolleeProviders() {
        setSearchClicked(true);
        setisLoading(true);

        try {
            const numbs = `${apiUrl}api/EnrolleeProfile/GetEnrolleeBioDataByEnrolleeID?enrolleeid=${enrolleeId}`;
            console.log("numbs", numbs);
            const response = await fetch(
                `${apiUrl}api/EnrolleeProfile/GetEnrolleeBioDataByEnrolleeID?enrolleeid=${enrolleeId}`,
                {
                    method: "GET",
                },
            );
            const data = await response.json();

            const customerName = data.result[0]?.Member_CustomerName;

            if (!customerName) {
                setEnrolleeUserName(null);
                setEnrolleeExists(false);
                setFilteredProviders([]);
                return;
            }

            setEnrolleeUserName(customerName);
            setEnrolleeExists(true);
            await GetFilteredProviders();
        } catch (error) {
            console.error("Error fetching enrollees:", error);
        } finally {
            setisLoading(false);
        }
    }

    // const handleExportAndSendEmail = async () => {
    //     setIsSubmitting(true);
    //     if (!enrolleeBioData || enrolleeBioData.trim() === "") {
    //         alert("Enrollee email is missing. Cannot send email.");
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     try {
    //         // Generate PDF with the table data
    //         const pdfBase64 = generatePdfBase64(FilteredProviders);

    //         const postData = {
    //             EmailAddress: enrolleeBioData,
    //             CC: "",
    //             BCC: "",
    //             Subject: "Leadway Health Provider List",
    //             MessageBody:
    //                 "Dear Enrollee, here are the lists of providers that you can access under your plan. Please find the attached PDF document.",
    //             Attachments: [
    //                 {
    //                     FileName: "Providers.pdf",
    //                     ContentType: "application/pdf",
    //                     Base64Data: pdfBase64,
    //                 },
    //             ],
    //             Category: "",
    //             UserId: 0,
    //             ProviderId: 0,
    //             ServiceId: 0,
    //             Reference: "",
    //             TransactionType: "",
    //         };

    //         console.log(
    //             "Submitting email with PDF attachment:",
    //             JSON.stringify(
    //                 {
    //                     ...postData,
    //                     Attachments: [
    //                         {
    //                             ...postData.Attachments[0],
    //                             Base64Data: pdfBase64,
    //                         },
    //                     ],
    //                 },
    //                 null,
    //                 2,
    //             ),
    //         );

    //         const response = await fetch(
    //             `${apiUrl}api/EnrolleeProfile/SendEmailAlert`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(postData),
    //             },
    //         );

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(
    //                 `HTTP error! Status: ${response.status}, Details: ${errorText}`,
    //             );
    //         }

    //         const data = await response.json();
    //         alert("Email with PDF attachment sent successfully!");
    //         console.log("Response:", data);
    //     } catch (error) {
    //         console.error("Error sending email:", error);
    //         alert(`Failed to send email: ${error.message}`);
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleExportAndSendEmail = async () => {
        setIsSubmitting(true);

        // Make sure email exists and is not just spaces
        if (
            !enrolleeBioData ||
            typeof enrolleeBioData !== "string" ||
            enrolleeBioData.trim() === ""
        ) {
            alert("Enrollee email is missing. Cannot send email.");
            setIsSubmitting(false);
            return;
        }

        if (!FilteredProviders || FilteredProviders.length === 0) {
            alert("No data to export!");
            setIsSubmitting(false);
            return;
        }

        try {
            const pdfBase64 = generatePdfBase64(FilteredProviders);

            const postData = {
                EmailAddress: enrolleeBioData.trim(), // Just in case
                CC: "",
                BCC: "",
                Subject: "Leadway Health Provider List",
                MessageBody:
                    "Dear Enrollee, here are the lists of providers that you can access under your plan. Please find the attached PDF document.",
                Attachments: [
                    {
                        FileName: "Providers.pdf",
                        ContentType: "application/pdf",
                        Base64Data: pdfBase64,
                    },
                ],
                Category: "",
                UserId: 0,
                ProviderId: 0,
                ServiceId: 0,
                Reference: "",
                TransactionType: "",
            };

            const response = await fetch(
                `${apiUrl}api/EnrolleeProfile/SendEmailAlert`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(postData),
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP error! Status: ${response.status}, Details: ${errorText}`,
                );
            }

            const data = await response.json();
            alert("Email with PDF attachment sent successfully!");
            console.log("Response:", data);
        } catch (error) {
            console.error("Error sending email:", error);
            alert(`Failed to send email: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const generatePdfBase64 = (data) => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.setTextColor(200, 30, 54);
        doc.text("Leadway Health Providers", 105, 15, { align: "center" });

        // Add subtitle
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Black
        doc.text("List of Available Providers Under Your Plan", 105, 25, {
            align: "center",
        });

        // Current date
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        doc.setFontSize(10);
        doc.text(`Generated on: ${dateStr}`, 105, 35, { align: "center" });

        // Format data for the table
        const tableData = data.map(
            ({ provider, phone1, phone2, Discipline, ProviderAddress }) => [
                provider?.trim() || "N/A",
                phone1?.trim() || "N/A",
                phone2?.trim() || "N/A",
                Discipline || "N/A",
                ProviderAddress || "N/A",
            ],
        );

        const tableHeaders = [
            [
                "Provider Name",
                "Primary Phone",
                "Alternative Phone",
                "Discipline",
                "Address",
            ],
        ];

        autoTable(doc, {
            head: tableHeaders,
            body: tableData,
            startY: 40,
            styles: {
                fontSize: 10,
                cellPadding: 3,
                overflow: "linebreak",
            },
            headStyles: {
                fillColor: [200, 30, 54],
                textColor: 255,
                fontStyle: "bold",
            },
            columnStyles: {
                0: { cellWidth: "auto" }, // Provider name column
                1: { cellWidth: "auto" }, // Primary phone column
                2: { cellWidth: "auto" }, // Alternative phone column
                3: { cellWidth: 30 }, // Discipline column
                4: { cellWidth: "auto" }, // Address column - auto width
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245], // Light gray for alternate rows
            },
            margin: { top: 40 },
        });

        // Add page numbers if the table spans multiple pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(
                `Page ${i} of ${pageCount}`,
                105,
                doc.internal.pageSize.height - 10,
                { align: "center" },
            );
        }

        // Add footer with company info
        doc.setPage(pageCount);
        doc.setFontSize(9);
        const footerText =
            "© Leadway Health - This document is automatically generated";
        doc.text(footerText, 105, doc.internal.pageSize.height - 20, {
            align: "center",
        });

        // Convert PDF to base64 string
        const pdfBase64 = doc.output("datauristring").split(",")[1];

        return pdfBase64;
    };
    return (
        <div className="w-full h-full p-7 md:h-[120vh] sm:h-[120vh] lg:h[100vh] bg-gray-200 rounded-lg shadow-md">
            <div className=" flex justify-between">
                <img
                    src="./leadway_health_logo-dashboard.png"
                    alt=""
                    className="  sm:w-[5rem] md:w-[7rem] lg:w-[10rem] w-[7rem]"
                />
            </div>
            <h1 className="font-bold text-center mb-6 gap-4 text-red-700 sm:text-[10px] md:text-[15px] lg:text-[30px] text-[16px]">
                Please fill all required fields.
            </h1>
            <div className="grid sm:grid-cols-1  md:grid-cols-3  lg:grid-cols-3 gap-4  sm:mx-[8rem] md:mx-[0.1rem] lg:mx-[0.1rem]">
                <div className="relative w-[full]  ">
                    <label className="block mb-2 text-gray-700 font-medium">
                        Input Enrollee Id
                    </label>
                    <div className="relative w-full">
                        <RxPerson
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Enter Enrollee Id"
                            value={enrolleeId}
                            onChange={handleEnroleeeInputChange}
                            className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-300 focus:outline-none "
                        />
                    </div>
                </div>
                <div className="relative w-[full]  ">
                    <label className="block mb-2 text-gray-700 font-medium">
                        Enrollee Names
                    </label>
                    <input
                        disabled
                        placeholder={enrolleeUserName}
                        className="w-full h-11 px-3 pr-3 rounded-lg border border-gray-300 focus:outline-none bg-white placeholder:text-black "
                    />
                </div>
                <div className="relative w-[full]   ">
                    <label className="block mb-2 text-gray-700 font-medium">
                        State of Residence
                    </label>
                    <DateDropdown
                        key="service-dropdown"
                        options={state.map((type) => ({
                            label: type.Text,
                            value: type.Value,
                        }))}
                        selectedValue={selectedState}
                        sendSelection={(selectedOption) =>
                            setState(selectedOption)
                        }
                        className="relative w-full h-[44px] rounded-lg outline-none"
                    />
                </div>

                {/* <div className="relative w-[full]  ">
                    <label className="block mb-2 text-gray-700 font-medium">
                        Local Govt
                    </label>
                    <DateDropdown
                        key="service-dropdown"
                        options={lga
                            .slice() // copy to avoid mutating original state
                            .sort((a, b) => a.Text.localeCompare(b.Text))
                            .map((type) => ({
                                label: type.Text,
                                value: type.Value,
                            }))}
                        selectedValue={selectedLga}
                        sendSelection={(selectedOption) =>
                            setSelectedLga(selectedOption)
                        }
                        className="relative w-full h-[44px] rounded-lg outline-none"
                    />
                </div> */}
            </div>
            <div className=" flex justify-between">
                <div></div>
                <button
                    type="button"
                    onClick={SearchEnrolleeProviders}
                    className="bg-green-500 text-white  justify-items-end  px-4 py-2 rounded mt-3  flex  sm:w-[10rem] md:w-[8rem]  "
                >
                    {isLoading ? (
                        <FaSpinner className="animate-spin w-5 h-5 mr-2" />
                    ) : (
                        <BsSearch className="w-5 h-5 mr-2" />
                    )}
                    Search
                </button>
            </div>

            <input
                type="text"
                onChange={handleSearch}
                value={searchProviders}
                placeholder="Search provider, specialty, or address"
                className="w-full md:w-[300px] sm:w-[200px] mt-3 mb-4 p-2 border border-gray-300 rounded outline-none"
            />
            <div className="max-h-[400px] overflow-y-auto mt-5">
                <table className="w-full text-sm text-left rtl:text-right text-black rounded-md border-collapse mt-3">
                    <thead className="text-base uppercase bg-white border-b border-gray-200 sticky top-0 z-10">
                        <tr className="border-b border-gray-200 bg-white">
                            <th className="px-6 py-3 text-[12px]">S/N</th>
                            <th className="px-3 py-3 text-[12px]">Provider</th>
                            <th className="px-3 py-3 text-[12px]">
                                Speciality
                            </th>
                            <th className="px-3 py-3 text-[12px]">Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                                        <img
                                            src="./loaderx.gif"
                                            alt="Loading animation"
                                            className="w-40 h-40"
                                        />
                                        <h3 className="text-gray-600 text-lg font-semibold">
                                            Please Wait, Fetching Providers...
                                        </h3>
                                    </div>
                                </td>
                            </tr>
                        ) : searchClicked && !enrolleeExists ? (
                            <tr>
                                <td colSpan="8" className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                                        <img
                                            src="./searchz.gif"
                                            alt="No enrollee"
                                            className="w-40 h-40"
                                        />
                                        <h3 className="text-gray-600 text-lg ml-9 font-semibold ">
                                            Enrollee does not exist.
                                        </h3>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedResults.length > 0 ? (
                            paginatedResults.map((enrollee, index) => (
                                <tr
                                    key={index}
                                    className="bg-white border border-gray-200 hover:bg-gray-200 cursor-pointer"
                                >
                                    <td className="px-3 py-3">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-3 py-3 text-[13px]">
                                        {enrollee.FullName ||
                                            enrollee.provider ||
                                            "N/A"}
                                    </td>
                                    <td className="px-3 py-3 text-[13px]">
                                        {enrollee.Specialty ||
                                            enrollee.Discipline ||
                                            "N/A"}
                                    </td>
                                    <td className="px-3 py-3 text-[13px]">
                                        {enrollee.add1 ||
                                            enrollee.ProviderAddress ||
                                            "N/A"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                                        <img
                                            src="./searchz.gif"
                                            alt="No records found"
                                            className="w-40 h-40"
                                        />
                                        <h3 className="text-gray-600 text-lg font-semibold">
                                            No provider found
                                        </h3>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className=" flex justify-items-end justify-end mt-3">
                {isSubmitting ? (
                    <button
                        disabled
                        className="bg-red-700 text-white px-3 py-2 justify-items-end rounded hover:bg-red-600 flex gap-2"
                    >
                        <FaSpinner className="animate-spin text-xl" />
                        Sending Email
                    </button>
                ) : (
                    <button
                        type="button"
                        className="bg-red-700 text-white px-3 py-2 justify-items-end rounded hover:bg-red-600 flex gap-2"
                        onClick={handleExportAndSendEmail}
                    >
                        <IoIosSend className=" text-white pt-1 h-6 w-6" />
                        Send Via Email...
                    </button>
                )}
            </div>
            {FilteredProviders?.length > itemsPerPage && (
                <div className="flex items-center justify-center  space-x-1 mt-2">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        First
                    </button>

                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(
                            Math.max(0, currentPage - 3),
                            Math.min(totalPages, currentPage + 2),
                        )
                        .map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 border rounded ${
                                    currentPage === page
                                        ? "bg-red-700 text-white"
                                        : ""
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>

                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Last
                    </button>
                </div>
            )}
        </div>
    );
};

export default Homepage;
