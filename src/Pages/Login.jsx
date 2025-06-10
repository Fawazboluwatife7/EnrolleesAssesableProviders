import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../Pages/Alert";

const Login = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordType, setPasswordType] = useState("password");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [alertType, setAlertType] = useState("");
    const [msg, setMsg] = useState("");
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const loginTypeArray = [
        {
            img: "/redMenuIcon.svg",
            title: "case Management",
            description: "Follow up on enrolles care",
        },
    ];

    const user = JSON.parse(localStorage.getItem("user"));
    // const handleLogin = async () => {
    //     if (!email || !password) {
    //         setMsg("Email and password are required.");
    //         setAlertType("error");
    //         return;
    //     }

    //     setLoading(true);

    //     try {
    //         const response = await fetch(
    //             `${apiUrl}/api/Account/ExternalPortalLogin`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify({
    //                     email,
    //                     password,
    //                     logInSource: "Sales",
    //                 }),
    //             },
    //         );

    //         const data = await response.json();
    //         console.log(response, data);
    //         if (response) setLoading(false);

    //         if (data.status !== 200) {
    //             setMsg(data.ErrorMessage);
    //             setAlertType("error");
    //             return;
    //         }

    //         // Login successful
    //         localStorage.setItem("user", JSON.stringify(data));
    //         navigate("/home");
    //     } catch (err) {
    //         setLoading(false);
    //         setError("An error occurred. Please try again later.");
    //         setTimeout(() => setError(null), 5000);
    //     }
    // };

    return (
        <div className="flex bg-[#F0F2FA] w-full h-[100vh]">
            <div className="pt-[3rem] lg:pl-[5rem] lg:w-[45%] w-full pl-[3rem] ">
                <img src="/LeadwayLogo.svg" alt="Leadway Logo" />
                <div>
                    <h1 className="text-[#585858] mt-[5rem] font-bold text-[32px]">
                        Experience Portal
                    </h1>
                    <p className="text-[#AFB0B1] text-[15px]">Welcome.</p>
                </div>
                <div className="lg:w-[80%] mt-8 w-[90%] ">
                    <div
                        className="bg-white p-[10px] px-7 py-5 flex justify-between items-center w-full rounded-[4px]"
                        style={{ boxShadow: "#0000000F" }}
                    >
                        <div className="w-[90%]">
                            <label className="block">Username</label>
                            <input
                                type="text"
                                placeholder="Enter email address"
                                className="outline-none w-full mt-[10px]"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <img src="/Loginicons@3x.svg" alt="Login Icon" />
                    </div>
                </div>

                <div className="lg:w-[80%] mt-7 w-[90%]">
                    <div
                        className="bg-white p-[10px] px-7 py-5 flex justify-between items-center w-full rounded-[4px]"
                        style={{ boxShadow: "#0000000F" }}
                    >
                        <div className="w-[90%]">
                            <label className="block">Password</label>
                            <input
                                type={passwordType}
                                placeholder="********************"
                                className="outline-none w-full mt-[10px]"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="text-center flex flex-col items-center">
                            {passwordType === "password" ? (
                                <p
                                    className="mb-3 text-[#C61531] cursor-pointer"
                                    onClick={() => setPasswordType("text")}
                                >
                                    SHOW
                                </p>
                            ) : (
                                <p
                                    className="mb-3 text-[#C61531] cursor-pointer"
                                    onClick={() => setPasswordType("password")}
                                >
                                    HIDE
                                </p>
                            )}
                            <img
                                src="HidePassword.svg"
                                alt="Hide Password Icon"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-8 w-[80%]">
                    <div className="flex gap-1">
                        <input
                            type="checkbox"
                            className="accent-[#C61531] w-4 h-4"
                        />
                        <p>Keep me logged in</p>
                    </div>
                </div>

                {/* <button
                    className="lg:w-[80%] w-[90%] bg-[#C61531] mt-8 py-4 rounded-[5px] text-white"
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button> */}
            </div>
            <div className="w-[55%] relative hidden lg:block">
                <img src="/xxx.jpg" alt="Doctor" className="h-full w-full" />
            </div>
            {msg && <Alert msg={msg} setMsg={setMsg} alertType={alertType} />}
        </div>
    );
};

export default Login;
