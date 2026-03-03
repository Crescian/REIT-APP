import { useState, useRef, useEffect, useCallback } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Legend, Bar, Cell, Line } from "recharts";

const P = {
  bg:"#06090f",card:"#0c1220",cardH:"#121a2e",bdr:"#182040",bdrH:"#263060",
  text:"#cdd6e4",mutd:"#7b88a0",dim:"#4e5a72",
  acc:"#38bdf8",accD:"#0c4a6e",grn:"#4ade80",grnD:"#14532d",
  red:"#f87171",redD:"#7f1d1d",amb:"#fbbf24",prp:"#a78bfa",prpD:"#4c1d95",
  w:"#fff",cyn:"#22d3ee",ros:"#fb7185",lim:"#a3e635",orn:"#fb923c",
};
const CONVICTION = {1:"🟢 HIGHEST",2:"🔵 HIGH",3:"🟡 MODERATE",4:"⚪ LOW"};
const CONV_CLR = {1:P.grn,2:P.acc,3:P.amb,4:P.dim};

const ASSET_TYPES = [
  {id:"reit",label:"REITs",icon:"🏢",color:P.acc,desc:"Real Estate Investment Trusts — direct property ownership, regulated distribution requirements"},
  {id:"trust",label:"Business Trusts",icon:"🔧",color:P.orn,desc:"Infrastructure & business trusts — concession-based, essential services, not subject to REIT regulations"},
  {id:"equity",label:"Equities",icon:"📊",color:P.prp,desc:"Single stock positions — operating companies with dividend income, no distribution mandates"},
];

const histData = {
  "CIP.AX":{data:[{y:"FY18",d:19.7,p:2.81,n:2.85},{y:"FY19",d:20.1,p:3.22,n:2.98},{y:"FY20",d:17.4,p:3.10,n:3.06},{y:"FY21",d:17.0,p:3.68,n:3.42},{y:"FY22",d:17.2,p:3.05,n:3.89},{y:"FY23",d:16.0,p:3.30,n:3.78},{y:"FY24",d:16.0,p:3.42,n:3.82},{y:"FY25",d:16.5,p:3.23,n:3.93},{y:"Feb26",d:16.5,p:3.15,n:null}],c:"A¢",pc:"A$"},
  "CLW.AX":{data:[{y:"FY19",d:28.4,p:4.98,n:4.77},{y:"FY20",d:28.8,p:4.15,n:4.81},{y:"FY21",d:29.1,p:5.22,n:5.34},{y:"FY22",d:30.2,p:4.18,n:5.44},{y:"FY23",d:28.0,p:3.75,n:4.77},{y:"FY24",d:26.0,p:4.02,n:4.66},{y:"FY25",d:25.0,p:4.18,n:4.59},{y:"FY26E",d:25.5,p:3.76,n:4.68},{y:"Feb26",d:25.5,p:3.8,n:null}],c:"A¢",pc:"A$"},
  "C2PU.SI":{data:[{y:"FY18",d:13.3,p:2.78,n:1.82},{y:"FY19",d:13.7,p:3.38,n:1.93},{y:"FY20",d:13.8,p:4.05,n:2.01},{y:"FY21",d:14.2,p:4.47,n:2.11},{y:"FY22",d:14.3,p:3.73,n:2.14},{y:"FY23",d:14.8,p:4.05,n:2.29},{y:"FY24",d:14.9,p:4.18,n:2.41},{y:"FY25",d:15.3,p:4.04,n:2.56},{y:"Feb26",d:15.3,p:4.1,n:null}],c:"S¢",pc:"S$"},
  "A17U.SI":{data:[{y:"FY18",d:15.5,p:2.56,n:2.08},{y:"FY19",d:15.9,p:2.98,n:2.14},{y:"FY20",d:15.2,p:2.92,n:2.21},{y:"FY21",d:15.9,p:2.96,n:2.19},{y:"FY22",d:15.8,p:2.62,n:2.27},{y:"FY23",d:15.3,p:2.72,n:2.30},{y:"FY24",d:15.3,p:2.78,n:2.42},{y:"FY25",d:15.0,p:2.82,n:2.50},{y:"Feb26",d:15,p:2.78,n:null}],c:"S¢",pc:"S$"},
  "ARF.AX":{data:[{y:"FY18",d:13.7,p:1.82,n:1.52},{y:"FY19",d:14.4,p:2.48,n:1.64},{y:"FY20",d:14.9,p:2.16,n:1.78},{y:"FY21",d:15.4,p:3.92,n:2.22},{y:"FY22",d:16.2,p:4.42,n:3.09},{y:"FY23",d:16.8,p:3.82,n:3.17},{y:"FY24",d:17.4,p:3.70,n:3.31},{y:"FY25",d:18.3,p:3.46,n:3.45},{y:"Feb26",d:18.3,p:3.5,n:null}],c:"A¢",pc:"A$"},
  "M44U.SI":{data:[{y:"FY20",d:8.3,p:1.75,n:1.23},{y:"FY21",d:8.8,p:1.77,n:1.28},{y:"FY22",d:9.1,p:1.50,n:1.36},{y:"FY23",d:9.0,p:1.58,n:1.42},{y:"FY24",d:9.0,p:1.55,n:1.45},{y:"FY25",d:8.1,p:1.22,n:1.50},{y:"Feb26",d:8.1,p:1.18,n:null}],c:"S¢",pc:"S$"},
  "RFF.AX":{data:[{y:"FY18",d:10.2,p:2.02,n:1.88},{y:"FY19",d:10.6,p:2.10,n:1.93},{y:"FY20",d:10.8,p:1.65,n:2.05},{y:"FY21",d:11.1,p:2.36,n:2.18},{y:"FY22",d:11.3,p:2.34,n:2.36},{y:"FY23",d:11.6,p:2.15,n:2.44},{y:"FY24",d:11.8,p:2.06,n:2.52},{y:"FY25",d:12.1,p:1.98,n:2.60},{y:"Feb26",d:12.1,p:1.95,n:null}],c:"A¢",pc:"A$"},
  "APA.AX":{data:[{y:"FY18",d:46.5,p:8.72,n:null},{y:"FY19",d:47.0,p:11.20,n:null},{y:"FY20",d:50.0,p:10.85,n:null},{y:"FY21",d:52.0,p:8.93,n:null},{y:"FY22",d:53.0,p:11.53,n:null},{y:"FY23",d:54.0,p:8.67,n:null},{y:"FY24",d:56.0,p:7.42,n:null},{y:"FY25",d:57.0,p:8.25,n:null},{y:"Feb26",d:57,p:7.8,n:null}],c:"A¢",pc:"A$"},
  "A7RU.SI":{data:[{y:"FY20",d:3.72,p:0.52,n:null},{y:"FY21",d:3.80,p:0.47,n:null},{y:"FY22",d:3.82,p:0.54,n:null},{y:"FY23",d:3.85,p:0.44,n:null},{y:"FY24",d:3.90,p:0.48,n:null},{y:"FY25",d:3.94,p:0.535,n:null},{y:"Feb26",d:3.94,p:0.54,n:null}],c:"S¢",pc:"S$"},
  "NOVN.SW":{data:[{y:"FY17",d:2.80,p:82,n:null},{y:"FY18",d:2.85,p:83,n:null},{y:"FY19",d:2.95,p:94,n:null},{y:"FY20",d:3.00,p:82,n:null},{y:"FY21",d:3.10,p:82,n:null},{y:"FY22",d:3.20,p:81,n:null},{y:"FY23",d:3.30,p:87,n:null},{y:"FY24",d:3.50,p:93,n:null},{y:"FY25",d:3.70,p:126,n:null},{y:"Feb26",d:3.7,p:100,n:null}],c:" CHF",pc:"CHF "},
  "ROG.SW":{data:[{y:"FY17",d:8.20,p:245,n:null},{y:"FY18",d:8.70,p:244,n:null},{y:"FY19",d:9.00,p:310,n:null},{y:"FY20",d:9.10,p:298,n:null},{y:"FY21",d:9.30,p:371,n:null},{y:"FY22",d:9.50,p:293,n:null},{y:"FY23",d:9.60,p:234,n:null},{y:"FY24",d:9.70,p:265,n:null},{y:"FY25",d:9.80,p:368,n:null},{y:"Feb26",d:9.8,p:290,n:null}],c:" CHF",pc:"CHF "},
  "CSL.AX":{data:[{y:"FY18",d:1.72,p:181,n:null},{y:"FY19",d:2.04,p:224,n:null},{y:"FY20",d:2.18,p:276,n:null},{y:"FY21",d:2.52,p:281,n:null},{y:"FY22",d:2.80,p:277,n:null},{y:"FY23",d:3.22,p:253,n:null},{y:"FY24",d:3.72,p:290,n:null},{y:"FY25",d:4.13,p:175,n:null},{y:"Feb26",d:4.13,p:260,n:null}],c:" A$",pc:"A$"},
  "NESN.SW":{data:[{y:"FY17",d:2.35,p:84,n:null},{y:"FY18",d:2.45,p:77,n:null},{y:"FY19",d:2.70,p:106,n:null},{y:"FY20",d:2.75,p:102,n:null},{y:"FY21",d:2.80,p:125,n:null},{y:"FY22",d:2.95,p:107,n:null},{y:"FY23",d:3.00,p:97,n:null},{y:"FY24",d:3.05,p:78,n:null},{y:"FY25E",d:3.10,p:74,n:null},{y:"Feb26",d:3.1,p:82,n:null}],c:" CHF",pc:"CHF "},
  "F34.SI":{data:[{y:"FY18",d:0.12,p:3.14,n:null},{y:"FY19",d:0.12,p:3.92,n:null},{y:"FY20",d:0.11,p:4.04,n:null},{y:"FY21",d:0.16,p:4.19,n:null},{y:"FY22",d:0.17,p:3.62,n:null},{y:"FY23",d:0.17,p:3.55,n:null},{y:"FY24",d:0.14,p:3.22,n:null},{y:"FY25E",d:0.14,p:3.44,n:null},{y:"Feb26",d:0.14,p:3.1,n:null}],c:" S$",pc:"S$"},
  "WOW.AX":{data:[{y:"FY18",d:0.93,p:28.6,n:null},{y:"FY19",d:0.96,p:34.5,n:null},{y:"FY20",d:0.72,p:37.9,n:null},{y:"FY21",d:1.06,p:39.4,n:null},{y:"FY22",d:0.78,p:34.5,n:null},{y:"FY23",d:0.94,p:37.2,n:null},{y:"FY24",d:1.02,p:33.0,n:null},{y:"FY25",d:0.90,p:28.0,n:null},{y:"Feb26",d:0.9,p:28.5,n:null}],c:" A$",pc:"A$"},
  "C38U.SI":{data:[{y:"FY18",d:10.0,p:1.96,n:null},{y:"FY19",d:10.1,p:2.19,n:null},{y:"FY20",d:8.7,p:1.87,n:null},{y:"FY21",d:10.4,p:2.22,n:null},{y:"FY22",d:10.5,p:1.99,n:null},{y:"FY23",d:10.8,p:1.99,n:null},{y:"FY24",d:10.9,p:2.08,n:null},{y:"FY25",d:11.6,p:2.18,n:null},{y:"Feb26",d:11.6,p:2.25,n:null}],c:"S¢",pc:"S$"},
  "CNA.LN":{data:[{y:"FY17",d:12.0,p:155,n:null},{y:"FY18",d:12.0,p:138,n:null},{y:"FY19",d:5.0,p:78,n:null},{y:"FY20",d:0,p:41,n:null},{y:"FY21",d:0,p:55,n:null},{y:"FY22",d:3.0,p:78,n:null},{y:"FY23",d:4.0,p:149,n:null},{y:"FY24",d:4.5,p:131,n:null},{y:"FY25",d:5.5,p:188,n:null},{y:"Feb26",d:5.5,p:190,n:null}],c:"p",pc:"GBX "},
  "EOAN.GR":{data:[{y:"FY17",d:0.30,p:9.1,n:null},{y:"FY18",d:0.43,p:8.6,n:null},{y:"FY19",d:0.46,p:9.8,n:null},{y:"FY20",d:0.47,p:8.9,n:null},{y:"FY21",d:0.49,p:11.2,n:null},{y:"FY22",d:0.51,p:9.0,n:null},{y:"FY23",d:0.53,p:12.1,n:null},{y:"FY24",d:0.53,p:12.7,n:null},{y:"FY25",d:0.55,p:11.8,n:null},{y:"Feb26",d:0.55,p:12.4,n:null}],c:" €",pc:"€"},
  "ELI.BB":{data:[{y:"FY18",d:1.54,p:56,n:null},{y:"FY19",d:1.66,p:68,n:null},{y:"FY20",d:1.73,p:86,n:null},{y:"FY21",d:1.79,p:97,n:null},{y:"FY22",d:1.84,p:141,n:null},{y:"FY23",d:1.91,p:104,n:null},{y:"FY24",d:1.96,p:90,n:null},{y:"FY25",d:2.02,p:95,n:null},{y:"Feb26",d:2.02,p:98,n:null}],c:" €",pc:"€"},
  "ENEL.IM":{data:[{y:"FY17",d:0.21,p:5.1,n:null},{y:"FY18",d:0.24,p:4.6,n:null},{y:"FY19",d:0.33,p:7.0,n:null},{y:"FY20",d:0.36,p:8.1,n:null},{y:"FY21",d:0.38,p:7.0,n:null},{y:"FY22",d:0.40,p:5.0,n:null},{y:"FY23",d:0.43,p:6.7,n:null},{y:"FY24",d:0.46,p:6.8,n:null},{y:"FY25",d:0.46,p:7.4,n:null},{y:"Feb26",d:0.46,p:7.2,n:null}],c:" €",pc:"€"},
  "ENGI.FP":{data:[{y:"FY17",d:0.70,p:14.1,n:null},{y:"FY18",d:0.75,p:12.6,n:null},{y:"FY19",d:0.80,p:14.8,n:null},{y:"FY20",d:0.53,p:12.8,n:null},{y:"FY21",d:0.85,p:12.2,n:null},{y:"FY22",d:1.40,p:14.0,n:null},{y:"FY23",d:1.43,p:16.0,n:null},{y:"FY24",d:1.43,p:15.6,n:null},{y:"FY25",d:1.10,p:17.2,n:null},{y:"Feb26",d:1.1,p:17.5,n:null}],c:" €",pc:"€"},
  "IBE.SM":{data:[{y:"FY17",d:0.32,p:6.5,n:null},{y:"FY18",d:0.34,p:7.1,n:null},{y:"FY19",d:0.37,p:9.7,n:null},{y:"FY20",d:0.40,p:11.1,n:null},{y:"FY21",d:0.42,p:10.3,n:null},{y:"FY22",d:0.44,p:10.7,n:null},{y:"FY23",d:0.51,p:11.5,n:null},{y:"FY24",d:0.56,p:13.2,n:null},{y:"FY25",d:0.60,p:14.1,n:null},{y:"Feb26",d:0.6,p:14.8,n:null}],c:" €",pc:"€"},
  "NG.LN":{data:[{y:"FY18",d:47.3,p:822,n:null},{y:"FY19",d:47.6,p:850,n:null},{y:"FY20",d:48.7,p:921,n:null},{y:"FY21",d:49.2,p:908,n:null},{y:"FY22",d:51.0,p:1050,n:null},{y:"FY23",d:55.4,p:1040,n:null},{y:"FY24",d:58.5,p:970,n:null},{y:"FY25",d:59.2,p:1025,n:null},{y:"Feb26",d:59.2,p:1050,n:null}],c:"p",pc:"GBX "},
  "NDX1.GR":{data:[{y:"FY18",d:0,p:8.2,n:null},{y:"FY19",d:0,p:11.4,n:null},{y:"FY20",d:0,p:20.1,n:null},{y:"FY21",d:0,p:14.6,n:null},{y:"FY22",d:0,p:11.3,n:null},{y:"FY23",d:0,p:10.5,n:null},{y:"FY24",d:0,p:12.8,n:null},{y:"FY25",d:0,p:11.0,n:null},{y:"Feb26",d:0,p:12.5,n:null}],c:" €",pc:"€"},
  "PPC.GA":{data:[{y:"FY19",d:0,p:2.8,n:null},{y:"FY20",d:0,p:4.5,n:null},{y:"FY21",d:0,p:6.2,n:null},{y:"FY22",d:0,p:6.8,n:null},{y:"FY23",d:0.25,p:9.8,n:null},{y:"FY24",d:0.40,p:11.4,n:null},{y:"FY25",d:0.45,p:13.2,n:null},{y:"Feb26",d:0.45,p:12.8,n:null}],c:" €",pc:"€"},
  "RWE.GR":{data:[{y:"FY17",d:0,p:18.5,n:null},{y:"FY18",d:0.70,p:19.8,n:null},{y:"FY19",d:0.80,p:26.8,n:null},{y:"FY20",d:0.85,p:34.2,n:null},{y:"FY21",d:0.90,p:33.8,n:null},{y:"FY22",d:0.90,p:42.8,n:null},{y:"FY23",d:1.00,p:32.6,n:null},{y:"FY24",d:1.10,p:30.5,n:null},{y:"FY25",d:1.10,p:30.2,n:null},{y:"Feb26",d:1.1,p:32,n:null}],c:" €",pc:"€"},
  "SRG.IM":{data:[{y:"FY17",d:0.21,p:3.9,n:null},{y:"FY18",d:0.22,p:3.7,n:null},{y:"FY19",d:0.23,p:4.6,n:null},{y:"FY20",d:0.24,p:4.5,n:null},{y:"FY21",d:0.25,p:5.0,n:null},{y:"FY22",d:0.25,p:4.8,n:null},{y:"FY23",d:0.26,p:4.5,n:null},{y:"FY24",d:0.28,p:4.5,n:null},{y:"FY25",d:0.28,p:4.6,n:null},{y:"Feb26",d:0.28,p:4.5,n:null}],c:" €",pc:"€"},
  "SLR.SM":{data:[{y:"FY19",d:0,p:5.2,n:null},{y:"FY20",d:0,p:17.8,n:null},{y:"FY21",d:0,p:16.2,n:null},{y:"FY22",d:0,p:15.5,n:null},{y:"FY23",d:0.02,p:12.1,n:null},{y:"FY24",d:0,p:9.8,n:null},{y:"FY25",d:0,p:8.5,n:null},{y:"Feb26",d:0,p:8,n:null}],c:" €",pc:"€"},
  "SSE.LN":{data:[{y:"FY18",d:89.4,p:1310,n:null},{y:"FY19",d:80.0,p:1180,n:null},{y:"FY20",d:80.0,p:1320,n:null},{y:"FY21",d:81.7,p:1570,n:null},{y:"FY22",d:60.0,p:1780,n:null},{y:"FY23",d:64.2,p:1720,n:null},{y:"FY24",d:63.0,p:1750,n:null},{y:"FY25",d:65.0,p:1940,n:null},{y:"Feb26",d:65,p:1980,n:null}],c:"p",pc:"GBX "},
  "VIE.FP":{data:[{y:"FY17",d:0.84,p:21.6,n:null},{y:"FY18",d:0.92,p:19.5,n:null},{y:"FY19",d:1.00,p:24.8,n:null},{y:"FY20",d:0.70,p:20.5,n:null},{y:"FY21",d:1.00,p:31.2,n:null},{y:"FY22",d:1.12,p:24.5,n:null},{y:"FY23",d:1.25,p:28.6,n:null},{y:"FY24",d:1.35,p:28.2,n:null},{y:"FY25",d:1.40,p:27.8,n:null},{y:"Feb26",d:1.4,p:29.5,n:null}],c:" €",pc:"€"},
  "VWS.DC":{data:[{y:"FY18",d:0.91,p:47,n:null},{y:"FY19",d:1.08,p:93,n:null},{y:"FY20",d:0.56,p:213,n:null},{y:"FY21",d:0.29,p:170,n:null},{y:"FY22",d:0,p:154,n:null},{y:"FY23",d:0,p:163,n:null},{y:"FY24",d:0,p:118,n:null},{y:"FY25",d:1.20,p:110,n:null},{y:"Feb26",d:1.2,p:95,n:null}],c:" DKK",pc:"DKK "},
  "AZN.LN":{data:[{y:"FY18",d:208,p:5850,n:null},{y:"FY19",d:220,p:7100,n:null},{y:"FY20",d:280,p:7480,n:null},{y:"FY21",d:280,p:8840,n:null},{y:"FY22",d:290,p:10600,n:null},{y:"FY23",d:298,p:10050,n:null},{y:"FY24",d:302,p:10900,n:null},{y:"FY25",d:310,p:11200,n:null},{y:"Feb26",d:310,p:12200,n:null}],c:"p",pc:"GBX "},
  "BAYN.GR":{data:[{y:"FY17",d:2.80,p:100,n:null},{y:"FY18",d:2.80,p:62,n:null},{y:"FY19",d:2.80,p:73,n:null},{y:"FY20",d:2.00,p:47,n:null},{y:"FY21",d:2.00,p:47,n:null},{y:"FY22",d:2.40,p:51,n:null},{y:"FY23",d:0.11,p:34,n:null},{y:"FY24",d:0.11,p:21,n:null},{y:"Feb26",d:0.11,p:23,n:null}],c:" €",pc:"€"},
  "BNTX.US":{data:[{y:"FY20",d:0,p:82,n:null},{y:"FY21",d:0,p:254,n:null},{y:"FY22",d:0,p:149,n:null},{y:"FY23",d:0,p:102,n:null},{y:"FY24",d:0,p:110,n:null},{y:"Feb26",d:0,p:106,n:null}],c:" $",pc:"$"},
  "GALD.SW":{data:[{y:"IPO24",d:0,p:55,n:null},{y:"FY24",d:0,p:82,n:null},{y:"Feb26",d:0,p:95,n:null}],c:" CHF",pc:"CHF "},
  "2616.HK":{data:[{y:"FY20",d:0,p:8.5,n:null},{y:"FY21",d:0,p:5.2,n:null},{y:"FY22",d:0,p:3.8,n:null},{y:"FY23",d:0,p:5.1,n:null},{y:"FY24",d:0,p:4.5,n:null},{y:"Feb26",d:0,p:5.0,n:null}],c:" HK$",pc:"HK$"},
  "ZEAL.DC":{data:[{y:"FY21",d:0,p:230,n:null},{y:"FY22",d:0,p:310,n:null},{y:"FY23",d:0,p:520,n:null},{y:"FY24",d:0,p:780,n:null},{y:"Feb26",d:0,p:350,n:null}],c:" DKK",pc:"DKK "},
  "NVO.US":{data:[{y:"FY18",d:0.52,p:24,n:null},{y:"FY19",d:0.64,p:30,n:null},{y:"FY20",d:0.74,p:35,n:null},{y:"FY21",d:0.86,p:56,n:null},{y:"FY22",d:0.96,p:68,n:null},{y:"FY23",d:1.08,p:101,n:null},{y:"FY24",d:1.16,p:118,n:null},{y:"FY25",d:1.23,p:66,n:null},{y:"Feb26",d:1.23,p:38,n:null}],c:" $",pc:"$"},
  "UCB.BB":{data:[{y:"FY18",d:1.19,p:63,n:null},{y:"FY19",d:1.24,p:72,n:null},{y:"FY20",d:1.26,p:84,n:null},{y:"FY21",d:1.30,p:91,n:null},{y:"FY22",d:1.32,p:75,n:null},{y:"FY23",d:1.35,p:88,n:null},{y:"FY24",d:1.39,p:148,n:null},{y:"FY25",d:1.42,p:160,n:null},{y:"Feb26",d:1.42,p:165,n:null}],c:" €",pc:"€"},
  "0867.HK":{data:[{y:"FY18",d:0.22,p:8.8,n:null},{y:"FY19",d:0.26,p:10.6,n:null},{y:"FY20",d:0.29,p:13.4,n:null},{y:"FY21",d:0.32,p:11.2,n:null},{y:"FY22",d:0.21,p:6.8,n:null},{y:"FY23",d:0.34,p:6.5,n:null},{y:"FY24",d:0.34,p:7.8,n:null},{y:"Feb26",d:0.34,p:13.0,n:null}],c:" HK$",pc:"HK$"},
  "1093.HK":{data:[{y:"FY18",d:0.18,p:7.8,n:null},{y:"FY19",d:0.20,p:8.2,n:null},{y:"FY20",d:0.20,p:6.8,n:null},{y:"FY21",d:0.24,p:7.6,n:null},{y:"FY22",d:0.28,p:6.2,n:null},{y:"FY23",d:0.14,p:5.5,n:null},{y:"FY24",d:0.26,p:4.9,n:null},{y:"Feb26",d:0.26,p:10.5,n:null}],c:" HK$",pc:"HK$"},
  "3692.HK":{data:[{y:"FY19",d:0.08,p:30.2,n:null},{y:"FY20",d:0.15,p:39.5,n:null},{y:"FY21",d:0.20,p:25.8,n:null},{y:"FY22",d:0.15,p:13.2,n:null},{y:"FY23",d:0.30,p:16.8,n:null},{y:"FY24",d:0.40,p:21.4,n:null},{y:"Feb26",d:0.40,p:28.0,n:null}],c:" HK$",pc:"HK$"},
  "1177.HK":{data:[{y:"FY18",d:0.06,p:7.2,n:null},{y:"FY19",d:0.07,p:9.8,n:null},{y:"FY20",d:0.08,p:8.5,n:null},{y:"FY21",d:0.08,p:5.8,n:null},{y:"FY22",d:0.06,p:4.2,n:null},{y:"FY23",d:0.05,p:3.1,n:null},{y:"FY24",d:0.09,p:3.8,n:null},{y:"Feb26",d:0.09,p:6.5,n:null}],c:" HK$",pc:"HK$"},
  "3347.HK":{data:[{y:"FY20",d:0.32,p:130,n:null},{y:"FY21",d:0.50,p:96,n:null},{y:"FY22",d:0.52,p:70,n:null},{y:"FY23",d:0.40,p:40,n:null},{y:"FY24",d:0.42,p:35,n:null},{y:"Feb26",d:0.42,p:38,n:null}],c:" HK$",pc:"HK$"},
  "AJBU.SI":{data:[{y:"FY18",d:7.32,p:1.24,n:null},{y:"FY19",d:7.61,p:1.85,n:null},{y:"FY20",d:9.01,p:2.64,n:null},{y:"FY21",d:9.85,p:2.52,n:null},{y:"FY22",d:10.01,p:1.72,n:null},{y:"FY23",d:10.03,p:2.02,n:null},{y:"FY24",d:9.80,p:2.10,n:null},{y:"FY25",d:10.8,p:2.40,n:null},{y:"Feb26",d:10.8,p:2.4,n:null}],c:"S¢",pc:"S$"},
  "CQE.AX":{data:[{y:"FY19",d:15.5,p:3.85,n:null},{y:"FY20",d:15.2,p:2.86,n:null},{y:"FY21",d:16.5,p:3.60,n:null},{y:"FY22",d:17.0,p:3.30,n:null},{y:"FY23",d:17.2,p:3.02,n:null},{y:"FY24",d:17.5,p:3.22,n:null},{y:"FY25",d:17.8,p:3.10,n:null},{y:"Feb26",d:17.8,p:3.15,n:null}],c:"A¢",pc:"A$"},
  "ASK.AX":{data:[{y:"FY21",d:5.9,p:1.32,n:null},{y:"FY22",d:6.3,p:1.25,n:null},{y:"FY23",d:6.0,p:1.10,n:null},{y:"FY24",d:6.2,p:1.15,n:null},{y:"FY25",d:6.4,p:1.12,n:null},{y:"Feb26",d:6.4,p:1.15,n:null}],c:"A¢",pc:"A$"},
  "INA.AX":{data:[{y:"FY19",d:21.2,p:5.42,n:null},{y:"FY20",d:10.0,p:4.18,n:null},{y:"FY21",d:12.0,p:5.85,n:null},{y:"FY22",d:12.5,p:5.10,n:null},{y:"FY23",d:12.0,p:4.28,n:null},{y:"FY24",d:12.2,p:4.55,n:null},{y:"FY25",d:12.5,p:4.30,n:null},{y:"Feb26",d:12.5,p:4.4,n:null}],c:"A¢",pc:"A$"},
  "U96.SI":{data:[{y:"FY18",d:4.0,p:2.35,n:null},{y:"FY19",d:4.0,p:2.40,n:null},{y:"FY20",d:4.0,p:1.58,n:null},{y:"FY21",d:4.0,p:2.08,n:null},{y:"FY22",d:8.0,p:3.40,n:null},{y:"FY23",d:18.0,p:4.95,n:null},{y:"FY24",d:18.0,p:5.45,n:null},{y:"FY25",d:20.0,p:6.50,n:null},{y:"Feb26",d:20,p:6.2,n:null}],c:"S¢",pc:"S$"},
  "BKW.SW":{data:[{y:"FY18",d:1.80,p:58,n:null},{y:"FY19",d:2.00,p:72,n:null},{y:"FY20",d:2.20,p:78,n:null},{y:"FY21",d:2.40,p:107,n:null},{y:"FY22",d:2.60,p:132,n:null},{y:"FY23",d:2.80,p:148,n:null},{y:"FY24",d:3.00,p:155,n:null},{y:"FY25",d:3.20,p:162,n:null},{y:"Feb26",d:3.2,p:165,n:null}],c:" CHF",pc:"CHF "},

  "SPG.US":{data:[{y:"FY18",d:7.00,p:170},{y:"FY19",d:7.50,p:148},{y:"FY20",d:5.20,p:85},{y:"FY21",d:6.60,p:158},{y:"FY22",d:7.00,p:116},{y:"FY23",d:7.60,p:142},{y:"FY24",d:8.20,p:165},{y:"FY25",d:8.80,p:190},{y:"Feb26",d:8.80,p:200}],c:" $",pc:"$"},
  "AVB.US":{data:[{y:"FY18",d:6.00,p:178},{y:"FY19",d:6.35,p:212},{y:"FY20",d:6.38,p:155},{y:"FY21",d:6.39,p:250},{y:"FY22",d:6.40,p:162},{y:"FY23",d:6.60,p:185},{y:"FY24",d:6.82,p:208},{y:"FY25",d:7.00,p:180},{y:"Feb26",d:7.12,p:177}],c:" $",pc:"$"},
  "HST.US":{data:[{y:"FY18",d:0.80,p:18.5},{y:"FY19",d:0.80,p:16.5},{y:"FY20",d:0,p:13},{y:"FY21",d:0,p:17},{y:"FY22",d:0.12,p:18},{y:"FY23",d:0.60,p:17},{y:"FY24",d:0.80,p:18},{y:"FY25",d:0.80,p:18.5},{y:"Feb26",d:0.80,p:20}],c:" $",pc:"$"},
  "SLG.US":{data:[{y:"FY18",d:3.49,p:88},{y:"FY19",d:3.54,p:92},{y:"FY20",d:3.25,p:42},{y:"FY21",d:3.25,p:72},{y:"FY22",d:3.28,p:38},{y:"FY23",d:1.87,p:48},{y:"FY24",d:2.50,p:62},{y:"FY25",d:3.12,p:55},{y:"Feb26",d:3.12,p:37}],c:" $",pc:"$"},
  "WELL.US":{data:[{y:"FY18",d:3.48,p:60},{y:"FY19",d:3.48,p:85},{y:"FY20",d:2.44,p:58},{y:"FY21",d:2.44,p:85},{y:"FY22",d:2.44,p:65},{y:"FY23",d:2.44,p:92},{y:"FY24",d:2.68,p:138},{y:"FY25",d:2.96,p:185},{y:"Feb26",d:2.96,p:208}],c:" $",pc:"$"},
  "N2IU.SI":{data:[{y:"FY19",d:9.30,p:1.98},{y:"FY20",d:9.07,p:1.72},{y:"FY21",d:9.54,p:1.88},{y:"FY22",d:8.55,p:1.55},{y:"FY23",d:8.21,p:1.35},{y:"FY24",d:8.10,p:1.32},{y:"FY25",d:8.05,p:1.42},{y:"Feb26",d:8.05,p:1.44}],c:"S¢",pc:"S$"},
};

const initData = [
  {assetType:"reit", theses:[
    {id:"healthcare",title:'"The Rich Get Old Too"',sub:"Premium Healthcare",icon:"🏥",conviction:1,color:P.ros,
      desc:"Affluent aging populations don't go to public hospitals. They go to private facilities — single rooms, boutique nursing homes, premium rehabilitation. This spending is completely recession-proof. Nobody delays a hip replacement because markets dipped. Australia will need ~$100B in new healthcare property over two decades, yet institutional ownership remains under 2% of the REIT index despite healthcare being 10% of GDP. Singapore's medical tourism attracts wealthy patients from across Southeast Asia. Japan's aging demographics create perpetual demand for nursing facilities.",
      items:[
        {tk:"C2PU.SI",nm:"Parkway Life REIT",ccy:"SGD",fl:"🇸🇬",al:100000,tag:"Hospitals / Nursing Homes",lk:"https://www.google.com/finance/quote/C2PU:SGX",int:false,mgr:"IHH Healthcare",src:"original",
          m:{pv:"S$2.5B",pr:"74",oc:"100%",wa:"14.9yr",ge:"35.4%",nt:"S$2.56",yl:"~3.8%",hd:"97%",rt:"—"},
          tn:["IHH Healthcare","Japan nursing ops","Colisée (France)"],
          rk:"1.58x P/B premium. Lower yield ~3.8%. BOJ rate hikes could pressure JPY assets. JPY/SGD FX translation risk on 60+ Japan properties.",
          ct:"Project Renaissance (S$350M MEH renovation) unlocking 27.6% DPU step-up over 4 years. Japan demographic tailwind is permanent. France nursing home integration adds European diversification.",
          writeup:"Parkway Life REIT is the crown jewel of this portfolio. It owns three of Singapore's most prestigious private hospitals — Mount Elizabeth, Gleneagles, and Parkway East — master-leased to IHH Healthcare. These are the hospitals where Singapore's wealthy, Southeast Asia's medical tourists, and expatriates go for specialist treatment.\n\n17 consecutive years of DPU growth. Not 17 years of operation — 17 years of increasing distributions, through the GFC, COVID-19, and the sharpest rate hiking cycle in 40 years. NTA has increased every single year. Occupancy has never dropped below 100%.\n\nBeyond Singapore, PLife owns 60 nursing homes in Japan (world's oldest population, 29% over 65) and 11 in France via Colisée. Project Renaissance — a S$350M renovation of Mount Elizabeth Hospital — triggers contractual rent step-ups delivering an estimated 27.6% DPU boost over four years. This is written into the master lease.\n\nThe premium valuation (1.58x P/B) is the main objection. But you're paying for near-certainty. Think of it as buying a AAA bond with a 2% real growth kicker — that's what 17 consecutive years of DPU growth functionally represents."},
      ]},
    {id:"datacentre",title:'"Data is the New Oil"',sub:"Essential Digital Infrastructure",icon:"🖥️",conviction:1,color:P.cyn,
      desc:"Data centres house the infrastructure every wealthy person's life runs on — private banking portals, wealth management platforms, streaming, cloud storage. Triple-net-like structures, 95%+ occupancy, contractual escalators, and demand growing at 20% CAGR through 2030 (McKinsey). Singapore's data centre moratorium since 2019 creates structural supply constraints — rental reversions of 40-50% on renewals. This is essential infrastructure with a permanent demand tailwind.",
      items:[
        {tk:"AJBU.SI",nm:"Keppel DC REIT",ccy:"SGD",fl:"🇸🇬",al:70000,tag:"Pure-Play Data Centres",lk:"https://www.google.com/finance/quote/AJBU:SGX",int:false,mgr:"Keppel Ltd",src:"ai",
          m:{pv:"S$6.3B",pr:"23 DCs",oc:"95.8%",wa:"4.7yr",ge:"35.3%",nt:"~S$1.70",yl:"~4.4%",hd:"76% fixed",rt:"—"},
          tn:["Hyperscalers (69%)","Enterprise clients","Colocation"],
          rk:"~1.5x P/B premium. Guangdong DCs underperforming. 4.7yr WALE shorter than peers. 66% Singapore concentration.",
          ct:"AI-driven hyperscale demand accelerating. Singapore moratorium = pricing power. 45% rental reversions in FY25. Expansion into Japan, South Korea, Europe. Sponsor pipeline.",
          writeup:"Keppel DC REIT is Asia's premier pure-play data centre REIT with S$6.3B across 23 data centres. The case rests on three pillars: (1) structurally insatiable demand — McKinsey projects 20% CAGR through 2030 from AI and cloud, (2) Singapore's moratorium creating extraordinary pricing power with 45% rental reversions, and (3) best-in-class financials — FY25 DPU grew 9.8% YoY, leverage at 35.3%, cost of debt just 3.0%, hyperscaler tenants (69%) are among the most creditworthy on earth.\n\nThe ~4.4% yield is lower than industrial REITs but the DPU growth trajectory more than compensates. Over 5 years, yield + growth should deliver high single to low double-digit total returns with dramatically lower risk than equities."},
        {tk:"A17U.SI",nm:"CapitaLand Ascendas REIT",ccy:"SGD",fl:"🇸🇬",al:80000,tag:"Industrial / Data Centres",lk:"https://www.google.com/finance/quote/A17U:SGX",int:false,mgr:"CapitaLand",src:"original",
          m:{pv:"S$17.7B",pr:"229",oc:"91.8%",wa:"3.7yr",ge:"37.4%",nt:"~S$2.50",yl:"~5.5%",hd:"~80%",rt:"A3"},
          tn:["~1,790 tenants","20+ industries","Government agencies"],
          rk:"US occupancy 87.3%. ~15% USD exposure. Gearing 37.4%. Shorter 3.7yr WALE.",
          ct:"S$724.6M assets completing H2 2025. DC allocation growing. +9.5% rental reversions H1 2025. S$1.3B pipeline.",
          writeup:"CapitaLand Ascendas REIT is the bedrock industrial REIT — Singapore's first and largest with S$17.7B across 229 properties. The A3 Moody's rating reflects ~1,790 tenants across 20+ industries, meaning no single default can materially impair income. DPU stable at 15.0-15.9 cents for 7 years.\n\nThe 3.7yr WALE is actually advantageous in rising rent environments — more frequent resets mean faster income growth. +9.5% rental reversions in H1 2025 prove this. At ~5.5% yield with A3 credit, this is the 'sleep at night' industrial anchor."},
      ]},
    {id:"social",title:'"The Subsidy Never Gets Cut"',sub:"Government-Backed Social Infrastructure",icon:"🏫",conviction:1,color:P.lim,
      desc:"Australia's Child Care Subsidy is politically untouchable. No government will campaign on reducing childcare funding. Dual-income families are the norm, female workforce participation targets require infrastructure, and there's a structural shortage of 100,000+ places nationally. Purpose-built childcare centres can't be repurposed. WALEs of 15-20 years because fit-out and licensing costs make relocation uneconomical. As close to a government bond yield with inflation protection as you'll find.",
      items:[
        {tk:"ARF.AX",nm:"Arena REIT",ccy:"AUD",fl:"🇦🇺",al:70000,tag:"Childcare / Social Infra",lk:"https://www.google.com/finance/quote/ARF:ASX",int:true,mgr:"Internal",src:"original",
          m:{pv:"~A$2.0B",pr:"295",oc:"100%",wa:"18.4yr",ge:"22.8%",nt:"~A$3.50",yl:"~5.6%",hd:"80%+",rt:"—"},
          tn:["Goodstart Early Learning","G8 Education","Healthcare operators"],
          rk:"CEO transition. Regulatory changes to subsidy formula possible. Market rent cap risk. Lower liquidity.",
          ct:"29 development projects (A$227M pipeline). 100,000+ place deficit deepening. FY26 DPU 19.25c = +5.5%. Internally managed.",
          writeup:"Arena REIT is the structurally safest holding in this portfolio. Internally managed (no external fee drag), 295 properties at 100% occupancy, 18.4yr WALE, lowest gearing at 22.8%. The income stream is quasi-government: operators collect Child Care Subsidy from Canberra, then pay rent to Arena.\n\n8 consecutive years of DPU growth at 4.2% CAGR. FY26 guidance 19.25c = +5.5%. Not spectacular, but the most predictable growth in the portfolio. At 22.8% gearing, enormous balance sheet capacity. This is your defensive anchor — the position you'd increase if everything else goes wrong."},
        {tk:"CQE.AX",nm:"Charter Hall Social Infra REIT",ccy:"AUD",fl:"🇦🇺",al:30000,tag:"Education / Healthcare / Govt",lk:"https://www.google.com/finance/quote/CQE:ASX",int:false,mgr:"Charter Hall",src:"ai",
          m:{pv:"~A$2.4B",pr:"400+",oc:"~99%",wa:"~12yr",ge:"~28%",nt:"~A$3.20",yl:"~5.2%",hd:"~75%",rt:"—"},
          tn:["Goodstart","G8 Education","State governments","Healthcare tenants"],
          rk:"Externally managed (fee drag). Non-childcare assets have different risk profiles. Smaller priority in Charter Hall stack.",
          ct:"Australia's largest early learning centre owner. Expanding into health, transport, government. Charter Hall deal flow. Government tenants.",
          writeup:"Charter Hall Social Infrastructure is Arena's bigger, more diversified sibling — largest owner of early learning centres plus health, emergency services, and government-tenanted properties. Government agencies are the most creditworthy tenants in Australia — they pay rent from consolidated revenue, not commercial operations. A police station doesn't close because of a recession.\n\nThe trade-off vs Arena: external management fees, but Charter Hall's platform provides superior off-market deal flow. This is the complementary position — together with Arena, 700+ government-backed properties."},
      ]},
    {id:"industrial",title:'"Irreplaceable Urban Industrial"',sub:"Logistics, Distribution & Long WALE",icon:"🏭",conviction:2,color:P.acc,
      desc:"Urban industrial land in Australian capitals is functionally irreplaceable. Councils rezone industrial to residential, shrinking total stock. E-commerce penetration rises, cold chain expands, data centres consume industrial sites. Vacancy approaching 1-2% in Sydney/Melbourne. Re-leasing spreads run 30-50% above expiring rents. Owning logistics within 20km of a CBD is like owning waterfront — they're not making more.",
      items:[
        {tk:"CIP.AX",nm:"Centuria Industrial REIT",ccy:"AUD",fl:"🇦🇺",al:80000,tag:"Industrial / Logistics",lk:"https://www.google.com/finance/quote/CIP:ASX",int:false,mgr:"Centuria Capital",src:"original",
          m:{pv:"A$3.9B",pr:"85",oc:"95.7%",wa:"7.1yr",ge:"35.9%",nt:"A$3.93",yl:"~5.5%",hd:"77%",rt:"—"},
          tn:["Telstra","Fujitsu","DHL","Australia Post","Linfox"],
          rk:"Occupancy 95.7% below peers. External management. Gearing 35.9%. Sydney/Melbourne concentration.",
          ct:"40MW Clayton data centre DA submitted. +44% re-leasing spreads. National vacancy heading below 2%. 12% already in data centres.",
          writeup:"Australia's largest pure-play industrial REIT — 85 assets worth A$3.9B. 85% sits in irreplaceable urban infill locations. The +44% re-leasing spread shows massive embedded rental upside not yet in DPU. Data centre optionality via Clayton 40MW facility. Trading 18% below NTA provides margin of safety.\n\nThe 5.5% yield plus embedded rental growth plus data centre optionality makes CIP one of the more compelling risk-reward propositions."},
        {tk:"CLW.AX",nm:"Charter Hall Long WALE REIT",ccy:"AUD",fl:"🇦🇺",al:80000,tag:"Long WALE / Triple Net",lk:"https://www.google.com/finance/quote/CLW:ASX",int:false,mgr:"Charter Hall",src:"original",
          m:{pv:"~A$6.0B",pr:"90+",oc:"99.9%",wa:"9.2yr",ge:"29.8%",nt:"A$4.68",yl:"~6.8%",hd:"80%",rt:"Baa1"},
          tn:["Coles","Telstra","Endeavour Group","Dept of Defence","BP"],
          rk:"DPU declined 16% from FY22 peak. Look-through gearing ~38%. Shorter Telstra leases approaching expiry. External management.",
          ct:"NTA re-rating potential (20% discount). Coles CoreWest 20yr lease completing 2027. $455M acquisitions. Baa1 rating. 2% DPU growth guided.",
          writeup:"The portfolio's highest-yielding REIT at ~6.8%, backed by Baa1 investment grade. A$6B across 90+ properties, 99.9% occupancy, 9.2yr WALE. 49% triple net leases — tenants pay all property expenses. Tenant roster: Coles, Telstra, Defence, BP, Endeavour Group.\n\nDPU fell ~16% from FY22 peak as rates rose, but has now stabilised with 2% growth guided. At 6.8% yield and 20% NTA discount, the market prices CLW for perpetual decline — if DPU merely stabilises, re-rating upside is substantial."},
      ]},
    {id:"agriculture",title:'"Food is Forever"',sub:"Agricultural Land & Water Rights",icon:"🌾",conviction:2,color:P.amb,
      desc:"Australian farmland has appreciated 8-10% annually for 20+ years. Population grows by 80M/year; arable land doesn't — it shrinks. Water rights in the Murray-Darling Basin are the new gold. Global food demand structurally rising: wealthier Asian populations eat more protein, dairy, nuts. Zero correlation with commercial property cycles. Office vacancies don't affect almond harvests.",
      items:[
        {tk:"RFF.AX",nm:"Rural Funds Group",ccy:"AUD",fl:"🇦🇺",al:40000,tag:"Farmland / Agriculture",lk:"https://www.google.com/finance/quote/RFF:ASX",int:false,mgr:"Rural Funds Mgmt",src:"original",
          m:{pv:"~A$1.8B",pr:"60+",oc:"100%",wa:"~10yr",ge:"~35%",nt:"~A$2.60",yl:"~6.1%",hd:"Majority",rt:"—"},
          tn:["JBS","Costa Group","Olam","Select Harvests"],
          rk:"Lower liquidity. Commodity price volatility. Climate risk. Past short-seller scrutiny (Bonitas 2019 — refuted).",
          ct:"Global food demand permanent. Water scarcity premium increasing. CPI-linked triple net. NTA up every year for 8+. 24% NTA discount.",
          writeup:"Unlike anything else in this portfolio — Australian farmland: cattle, almonds, macadamias, vineyards, poultry. A$1.8B on triple net, CPI-linked leases with ~10yr terms to JBS, Costa, Olam, Select Harvests.\n\n2-3% DPU growth every year for 8+ years — mechanical CPI escalators. NTA from A$1.88 (FY18) to A$2.60 (FY25), yet price at 24% discount. Water rights in the Murray-Darling appreciating faster than land. Zero correlation to commercial property is the portfolio construction benefit."},
      ]},
    {id:"storage",title:'"People Accumulate, They Don\'t Simplify"',sub:"Premium Self-Storage",icon:"📦",conviction:2,color:P.prp,
      desc:"The wealthy accumulate — art, wine, furniture, equipment, archives. Premium self-storage in affluent metros services this permanent tendency. Average tenure 2-3 years; many stay far longer. Cost of storage is trivial relative to stored items. Occupancy runs 90%+ through recessions. Consolidation tailwind: fragmented ownership being rolled up by listed operators.",
      items:[
        {tk:"ASK.AX",nm:"Abacus Storage King",ccy:"AUD",fl:"🇦🇺",al:35000,tag:"Self-Storage Platform",lk:"https://www.google.com/finance/quote/ASK:ASX",int:false,mgr:"Abacus Group",src:"ai",
          m:{pv:"~A$1.5B",pr:"115+",oc:"~92%",wa:"N/A (monthly)",ge:"~30%",nt:"~A$1.45",yl:"~4.0%",hd:"—",rt:"—"},
          tn:["Individual consumers","Small businesses","Corporate clients"],
          rk:"Month-to-month leases (no WALE). Occupancy can fluctuate. Minimalism headwind. East coast concentration.",
          ct:"Public Storage consortium bid $2.17B — rejected. M&A floor. Market growing 7% pa to 2030. 21 development sites.",
          writeup:"115+ facilities, 616,000 sqm. Self-storage is uniquely sticky — customers sign up, move items in, then stay 2-10 years. Monthly rental ($200-400) rarely triggers cancellation even in downturns. The M&A catalyst: Public Storage (world's largest) bid $2.17B and was rejected — creates a price floor and signals deep value to sophisticated global capital.\n\n~4% yield is thinner but 7% annual market growth plus M&A upside compensates."},
      ]},
    {id:"landlease",title:'"Downsizers Don\'t Downgrade"',sub:"Premium Land Lease Retirement",icon:"🏡",conviction:2,color:P.ros,
      desc:"Affluent over-55s sell their A$2-3M home and move into resort-style land lease communities — pools, gyms, cinemas, pickleball. They buy the house, lease the land, pay weekly site fees. The operator owns the land forever and collects CPI-linked rent forever. One of Australia's fastest-growing property sub-sectors.",
      items:[
        {tk:"INA.AX",nm:"Ingenia Communities Group",ccy:"AUD",fl:"🇦🇺",al:30000,tag:"Land Lease / Holiday Parks",lk:"https://www.google.com/finance/quote/INA:ASX",int:false,mgr:"Ingenia (internal)",src:"ai",
          m:{pv:"~A$2.7B",pr:"100+",oc:"~97%",wa:"Perpetual",ge:"~30%",nt:"~A$4.00",yl:"~3.0%",hd:"—",rt:"—"},
          tn:["Over-55s residents","Holiday park guests","Sun Communities (JV)"],
          rk:"Part developer — lumpy home sales. Lower yield (~3%). Victorian housing weakness. Development execution risk.",
          ct:"Lifestyle brand >45% of $2.7B portfolio. 100 communities. 10-15% settlement CAGR pipeline. Holiday parks. Sun Communities JV validation. ASX 200.",
          writeup:"Part REIT, part developer, part resort operator. Core business: build homes on owned land, sell home, collect weekly site fees perpetually. When resident sells, Ingenia keeps the land and fees continue. An annuity model where income outlives any individual resident.\n\nLifestyle brand delivered 39% of portfolio EBIT in FY25. Entry prices A$400K-800K — these are premium, not budget. ~3% yield reflects growth reinvestment; over time, recurring rental base grows and distributions should follow. Sun Communities (NYSE: SUI, US$15B) JV validates the model."},
      ]},
    {id:"luxury",title:'"Luxury Travel Doesn\'t Cancel"',sub:"Premium Hospitality",icon:"✈️",conviction:3,color:P.amb,
      desc:"During every recession, luxury hotel RevPAR recovers fastest. During the GFC, Maldives resorts barely blinked. The ultra-wealthy don't cancel vacations — they redirect. The thesis: luxury hospitality REITs with master leases and minimum rent guarantees can provide defensive income from an asset class most dismiss as cyclical.",
      items:[
        {tk:"MINT-REIT.SI",nm:"Minor Hotels REIT (IPO Pending)",ccy:"SGD",fl:"🇸🇬",al:60000,tag:"Luxury Resorts / Hotels",lk:"https://www.google.com/finance/quote/MINT:BKK",int:false,mgr:"Minor International",src:"ai",
          m:{pv:"~S$1.3B (est.)",pr:"~14 hotels",oc:"~70%",wa:"Master lease",ge:"TBD",nt:"TBD",yl:"~5-6% (est.)",hd:"TBD",rt:"TBD"},
          tn:["Anantara Hotels","Tivoli Hotels","NH Collection","Minor Hotels"],
          rk:"IPO — no listed track record. Hospitality inherently more cyclical. Parent leverage high (~1.8x D/E). FX risk.",
          ct:"Purest luxury REIT in SGD. Anantara Maldives/Thailand/Europe. Luxury RevPAR grew 10-12% in 2025. 14 hotels ~US$1B. Minor expanding to 850 hotels by 2028.",
          writeup:"Most exciting upcoming IPO for luxury income investors. Minor International plans ~US$1B Singapore-listed REIT comprising ~14 hotels: Anantara resorts (Maldives, Thailand, Europe), Tivoli, NH Collection.\n\nAnantara charges US$800-2,000/night. The clientele — family offices, tech founders, banking executives — don't check the S&P before booking. Master lease structure transforms cyclical hotel operation into quasi-fixed income.\n\nRated Moderate conviction: IPO with no track record, prospectus unreleased, hospitality is cyclical. Monitor SGX for filing in H2 2026."},
      ]},
    {id:"logistics",title:'"Pan-Asian Supply Chains"',sub:"Asian Logistics Recovery",icon:"🚢",conviction:3,color:P.dim,
      desc:"Asia's logistics infrastructure is being rebuilt for post-COVID, post-tariff supply chains diversifying out of China into Vietnam, India, Indonesia. This is a recovery bet: logistics REITs priced for permanent decline, but structural demand drivers remain intact.",
      items:[
        {tk:"M44U.SI",nm:"Mapletree Logistics Trust",ccy:"SGD",fl:"🇸🇬",al:50000,tag:"Pan-Asian Logistics",lk:"https://www.google.com/finance/quote/M44U:SGX",int:false,mgr:"Mapletree (Temasek)",src:"original",
          m:{pv:"S$13.0B",pr:"175",oc:"96.1%",wa:"2.7yr",ge:"41.1%",nt:"~S$1.50",yl:"~6.5%",hd:"84%",rt:"Baa2"},
          tn:["970+ customers","85% domestic consumption"],
          rk:"HIGHEST RISK. Gearing 41.1%. DPU declined 10.6% FY25. China 17% with negative reversions. Short 2.7yr WALE. FX drag.",
          ct:"Rate cuts reduce financing costs. China stabilisation reverses negative reversions. India/Vietnam at 100% occ. Temasek 26% sponsor. 19% below NTA.",
          writeup:"Highest-risk, highest-yield position — deliberately sized small at $50K. S$13B across 175 properties in 9 Asian countries. DPU fell 10.6% in FY25, gearing uncomfortable at 41.1%.\n\nWhy include it? (1) Temasek holds 26% — deep pockets and aligned interests, (2) at 19% NTA discount and 6.5% yield, market prices for permanent decline — if China merely stabilises and rates ease, DPU could recover 10-15%, (3) India/Vietnam at 100% occupancy. You're paid 6.5% to wait."},
      ]},
  ]},
  {assetType:"trust", theses:[
    {id:"utilities",title:'"The Lights Stay On"',sub:"Power, Water & Waste Infrastructure",icon:"⚡",conviction:4,color:P.orn,
      desc:"Essential utility infrastructure — power generation, water desalination, waste-to-energy — is the most recession-proof business in existence. People don't stop using electricity or flushing toilets in a downturn. Singapore's Keppel Infrastructure Trust provides exposure to these assets through a business trust structure, which differs from REITs in that it holds operating concessions rather than direct property. The trade-off: concessions have expiry dates, creating a treadmill effect where management must constantly acquire new assets to replace maturing income streams. The yield is attractive but the quality of earnings requires scrutiny.",
      items:[
        {tk:"A7RU.SI",nm:"Keppel Infrastructure Trust",ccy:"SGD",fl:"🇸🇬",al:35000,tag:"Power / Water / Waste",lk:"https://www.google.com/finance/quote/A7RU:SGX",int:false,mgr:"Keppel Ltd",src:"ai",
          m:{pv:"~S$9.1B",pr:"10+ assets",oc:"100%",wa:"Concession",ge:"38.7%",nt:"—",yl:"~7.4%",hd:"72% fixed",rt:"—"},
          tn:["City Energy (gas)","KMC (power)","SingSpring (water)","Senoko (waste)","Ixom (chemicals)"],
          rk:"DPU sustained by S$49M divestment gains in FY25 — strip those out and underlying income is soft. Concessions expire (SingSpring land lease 2033). Environmental services struggling (EMK losses). Constant acquisition treadmill to maintain DPU. Complex multi-asset structure reduces transparency.",
          ct:"S$9.1B diversified essential infrastructure portfolio. 90%+ revenue inflation-protected through cost pass-through. New digital infrastructure segment (Global Marine Group). Keppel sponsor ecosystem provides deal pipeline. Rate cuts reduce financing costs (4.4% WACD).",
          writeup:"Keppel Infrastructure Trust is Singapore's largest listed infrastructure business trust with ~S$9.1B in assets across power generation (Keppel Merlimau Cogen — 1,300MW supplying ~10% of Singapore's electricity), gas distribution (City Energy), water desalination (SingSpring, Marina East), waste-to-energy (Senoko, Tuas South), and chemical distribution (Ixom in Australia/NZ).\n\nThe appeal is clear: essential services that people use regardless of economic conditions, with over 90% of revenue protected against inflation through cost pass-through mechanisms. FY2025 DPU rose 1% to 3.94 cents, translating to a 7.4% distribution yield. The 10-year total unitholder return of 96% demonstrates the compounding power of high yield over time.\n\nHowever, this position carries important caveats that warrant its Low conviction rating. First, FY2025's distributable income was boosted by S$49M in divestment gains from selling Philippine Coastal and part of Ventura — strip those out and underlying income was essentially flat. Second, the environmental services segment is struggling, with Eco Management Korea reporting losses and Senoko WTE contributing less after its concession extension. Third, the SingSpring desalination plant's land lease expires in 2033, creating a visible income cliff.\n\nThe fundamental challenge with infrastructure trusts is the concession treadmill: unlike REITs where property value typically appreciates over time, concession assets have finite lives. Management must continuously acquire new assets just to maintain current distribution levels. This works when deals are accretive, but it introduces execution risk and balance sheet pressure.\n\nThis is a 'show me' position — the yield is attractive enough to hold, but conviction increases only if management demonstrates it can sustainably grow distributable income without relying on divestment gains."},
      ]},
  ]},
  {assetType:"equity", theses:[
    {id:"gas_infra",title:'"The Transition Fuel"',sub:"Gas Pipeline Infrastructure",icon:"🔥",conviction:2,color:P.grn,
      desc:"Gas is the transition fuel. Even in a world moving toward renewables, gas-fired power provides the backup and peaking capacity that intermittent solar and wind cannot. Every new wind farm and solar installation actually increases the need for gas peakers and pipeline capacity. Regulated gas pipelines earn inflation-linked tariffs set by the Australian Energy Regulator, creating a quasi-government income stream. The physical pipeline network is a natural monopoly — you can't build a competing pipeline next to an existing one. This is toll-road economics applied to energy molecules.",
      items:[
        {tk:"APA.AX",nm:"APA Group",ccy:"AUD",fl:"🇦🇺",al:45000,tag:"Gas Pipelines / Energy Infra",lk:"https://www.google.com/finance/quote/APA:ASX",int:false,mgr:"APA Group (internal)",src:"ai",
          m:{pv:"~A$22B",pr:"15,000km",oc:"Regulated",wa:"Long-term",ge:"~6.3x D/EBITDA",nt:"—",yl:"~6.1%",hd:"Majority",rt:"BBB/Baa2"},
          tn:["Origin Energy","Santos","BHP","Alinta","Retailers"],
          rk:"Regulatory reset risk every 5 years — tariffs can be reduced. Long-term secular risk if hydrogen replaces gas (decades away). High capex requirements for expansion and maintenance. Shares already rallied 30% in 2025 — not buying at a deep discount. High debt levels (6.3x D/EBITDA) typical for infrastructure but limits flexibility. Dividend growth has been modest (1-2% pa) despite 20-year streak.",
          ct:"20 consecutive years of dividend growth — second-longest streak on the ASX. East Coast Gas Grid Stage 3 Expansion = 30% capacity increase. Inflation-linked regulated tariffs provide automatic income growth. Free cash flow of A$1.08B on A$12B market cap = 12x FCF. Beetaloo Basin gas pipeline partnership with Tamboran. Brigalow gas-powered generation project. Rate cuts improve valuation and reduce financing costs.",
          writeup:"APA Group is Australia's largest energy infrastructure company, owning 15,000km of gas pipelines that transport half of the nation's natural gas. It also operates gas storage, processing, power stations, 600km of high-voltage transmission lines, and renewable energy facilities.\n\nThe investment case for your defensive income mandate is built on one extraordinary statistic: 20 consecutive years of distribution growth. Twenty years. Through the GFC, through the mining downturn, through COVID, through the most aggressive rate hiking cycle in 40 years. This is the second-longest dividend growth streak on the entire ASX. The distribution is expected to grow to 58 cents per security in FY26.\n\nThe revenue model is the key: APA's pipeline tariffs are predominantly regulated by the Australian Energy Regulator or locked into long-term contracts. These tariffs are inflation-linked, meaning as CPI rises, APA's revenue rises automatically. The physical pipeline network is a natural monopoly — the cost of building a competing pipeline alongside an existing one is prohibitive, giving APA enormous pricing power within its regulated framework.\n\nThe 'transition fuel' thesis reinforces the demand outlook: as Australia builds more intermittent renewable energy (solar, wind), the grid requires more gas-fired peaking capacity to fill the gaps when the sun doesn't shine and the wind doesn't blow. Every solar farm installation paradoxically increases the need for gas backup — and that gas flows through APA's pipes.\n\nFree cash flow of A$1.08 billion against a A$12 billion market cap puts APA at roughly 12x FCF — a reasonable valuation for a regulated infrastructure monopoly with inflation protection and two decades of distribution growth.\n\nThe risks are real but manageable: regulatory resets every 5 years can reduce tariffs (but the regulator has an incentive to maintain APA's financial viability), and the long-term secular shift away from gas is a headwind (but measured in decades, not years). The BBB/Baa2 investment grade rating and 6.1% yield make APA the natural 'utilities' complement to your REIT portfolio — different asset class, same defensive income philosophy."},
      ]},
    {id:"renewables",title:'"Energy Transition Operator"',sub:"Renewable Energy & Power Generation",icon:"☀️",conviction:3,color:P.cyn,
      desc:"The global energy transition is a multi-trillion dollar capital reallocation from fossil fuels to renewables. Companies that own and operate renewable energy assets — wind farms, solar installations, energy storage — benefit from long-term power purchase agreements that provide contracted, predictable revenue. The thesis is not about betting on technology; it's about owning the physical assets that generate electricity in a world where electricity demand is structurally rising due to AI, electrification of transport, and industrial digitisation.",
      items:[
        {tk:"U96.SI",nm:"Sembcorp Industries",ccy:"SGD",fl:"🇸🇬",al:35000,tag:"Power / Renewables / Utilities",lk:"https://www.google.com/finance/quote/U96:SGX",int:false,mgr:"Sembcorp (Temasek-linked)",src:"ai",
          m:{pv:"~S$11B mkt cap",pr:"18.9 GW renewables",oc:"Operational",wa:"PPA-based",ge:"Moderate",nt:"—",yl:"~3.6-4%",hd:"—",rt:"—"},
          tn:["Singapore power consumers","India wind/solar","China renewables","Alinta (Australia)"],
          rk:"China renewables oversupply pressuring earnings — wind power prices declining and grid curtailment limiting output. Alinta acquisition (A$6.5B) brings coal exposure (Loy Yang B). Dividend history volatile over 10 years — not a steady income compounder. FX risk from SGD strengthening against INR and CNY. Singapore power business facing margin compression from Solar Sharer policy. Growth stock masquerading as a utility — yield only ~3.6%.",
          ct:"Alinta acquisition immediately earnings-accretive (EPS +14% pro-forma). Growing from 16.8 GW to 25 GW renewables by 2028. India operations performing well with 27% renewables profit growth in H1 2025. Interim dividend raised to S$0.09 (from S$0.06). Low payout ratio (45.7%) leaves room for dividend growth. Temasek-linked — strong institutional backing.",
          writeup:"Sembcorp Industries has transformed from a traditional fossil fuel conglomerate into one of Asia's leading renewable energy operators. The company operates gas-fired power in Singapore (its cash cow), plus a rapidly expanding wind and solar portfolio across India, China, the UK, and now Australia via the blockbuster A$6.5 billion Alinta acquisition.\n\nThe Alinta deal is transformative: it makes Sembcorp Australia's fourth-largest utilities provider overnight, adding 1.1 million customers and 3.4 GW of generation capacity plus a 10.4 GW development pipeline. The acquisition is immediately earnings-accretive, with pro-forma EPS rising 14%.\n\nThe renewables growth trajectory is impressive: 18.9 GW of gross capacity as of mid-2025, targeting 25 GW by 2028. Renewables profit rose 27% in H1 2025 on favorable wind conditions in India and new project contributions. The low payout ratio (45.7%) means substantial room for dividend increases as earnings grow.\n\nHowever, for your specific defensive income mandate, Sembcorp has important limitations. The dividend yield is only ~3.6-4%, making it primarily a capital appreciation play rather than an income generator. Dividend payments have been volatile over the past decade — this is not Arena REIT's 8-year growth streak. The China renewables exposure is a genuine concern, with oversupply pressuring wind power prices and grid operators curtailing output. And the Alinta acquisition, while strategically sound, brings coal plant exposure (Loy Yang B) that complicates the clean energy narrative.\n\nThis is best understood as a growth-oriented utilities position: you're buying the energy transition at a reasonable valuation (12x P/E), with the expectation that dividend growth accelerates as the renewables portfolio scales. It complements APA's regulated steady-state income with higher-growth, higher-risk energy exposure."},
      ]},
    {id:"swiss_utility",title:'"Swiss Precision, Swiss Stability"',sub:"CHF-Denominated Utility",icon:"🇨🇭",conviction:3,color:P.dim,
      desc:"Swiss utilities are among the most stable businesses on the planet. Electricity demand is steady, the regulatory environment is predictable, and hydroelectric power has essentially zero fuel cost — when it rains, you generate electricity for free. The Swiss franc itself is a defensive asset that tends to appreciate during global crises. Owning a Swiss utility denominated in CHF provides both income and currency diversification against the portfolio's AUD/SGD concentration.",
      items:[
        {tk:"BKW.SW",nm:"BKW AG",ccy:"CHF",fl:"🇨🇭",al:25000,tag:"Hydro / Wind / Energy Services",lk:"https://www.google.com/finance/quote/BKW:SWX",int:false,mgr:"Canton of Berne (52%)",src:"ai",
          m:{pv:"~CHF 8.8B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Regulated/Contract",ge:"Moderate",nt:"—",yl:"~2.2-2.5%",hd:"—",rt:"—"},
          tn:["Swiss residential consumers","Swiss commercial/industrial","Grid operators"],
          rk:"Yield at 2.2% is very low for an income portfolio. Energy services/engineering division adds cyclicality — not pure utility. Liquidity may be lower for Singapore-based investors. Swiss withholding tax on dividends (35%, partially reclaimable). Price appreciation has compressed the yield further. Canton of Berne majority ownership limits corporate action potential.",
          ct:"14 consecutive years of dividend payments with no cuts — 10.96% 5-year dividend growth rate. Hydroelectric generation = zero fuel cost, pure margin when rain/snow falls. Canton of Berne 52% ownership = quasi-government backing. CHF as safe-haven currency provides portfolio hedge. Low payout ratio (31%) means substantial room for further dividend increases. Expanding renewable portfolio (wind, solar, battery storage).",
          writeup:"BKW AG is a Berne-based integrated energy company whose core business is hydroelectric power generation — one of the purest and most profitable forms of electricity production. When snow melts in the Alps or rain fills the reservoirs, BKW generates electricity at essentially zero marginal cost. This natural advantage has underpinned 14 consecutive years of dividend payments with no cuts.\n\nThe Canton of Berne owns approximately 52% of BKW, providing quasi-government backing that makes this one of the safest utility investments in Europe. The Swiss regulatory environment is exceptionally stable and predictable — there are no sudden Solar Sharer-type policy interventions that plague Australian utilities.\n\nThe 5-year dividend growth rate of 10.96% is impressive, and the low payout ratio of 31% indicates significant room for further increases. BKW is also expanding its renewable portfolio beyond hydro into wind, solar, and battery storage, positioning it for the European energy transition.\n\nThe primary limitation for your portfolio is the yield: at ~2.2-2.5%, it's the thinnest income stream in the entire basket. You're buying BKW primarily for three reasons: (1) CHF currency diversification — your portfolio is currently 100% AUD/SGD, and the Swiss franc is the world's premier safe-haven currency that appreciates during crises, (2) the quasi-government backing provides a level of safety that even PLife can't match, and (3) the dividend growth trajectory suggests the yield will compound meaningfully over time even from a low base.\n\nBKW is also not a pure utility anymore — its energy services and engineering division (installation, maintenance, consulting) has grown into a substantial revenue contributor, adding some cyclicality. But the core hydroelectric business remains the anchor.\n\nSize this position for what it is: a CHF currency hedge with a growing dividend, not a primary income generator. The CHF$25K allocation reflects this supporting role."},
      ]},
    {id:"pharma",title:'"Take This or Die"',sub:"Essential Pharmaceutical Income",icon:"💊",conviction:2,color:P.ros,
      desc:"The ultimate non-discretionary spend. Patients with primary immunodeficiency die without immunoglobulin infusions. Heart failure patients die without Entresto. Cancer patients relapse without Kisqali. No recession, no market crash, no political change alters the fact that these patients must take their medicine. Pharmaceutical companies with dominant positions in life-sustaining therapies generate the most recession-proof revenue streams on earth — and the best ones convert that into decades of consecutive dividend growth.",
      items:[
        {tk:"NOVN.SW",nm:"Novartis AG",ccy:"CHF",fl:"🇨🇭",al:37000,tag:"Oncology / Cardio / Immuno",lk:"https://www.google.com/finance/quote/NOVN:SWX",int:false,mgr:"Novartis (Vas Narasimhan, CEO)",src:"ai",
          m:{pv:"~USD 54B rev",pr:"Multi-asset",oc:"Operational",wa:"Patent/Pipeline",ge:"Moderate",nt:"—",yl:"~2.9-3.2%",hd:"—",rt:"AA-/Aa3"},
          tn:["Entresto (heart failure)","Kisqali (breast cancer)","Kesimpta (MS)","Cosentyx (psoriasis)","Pluvicto (prostate)","Scemblix (CML)"],
          rk:"Entresto US generics now launched — largest patent expiry in Novartis history. Swiss 35% withholding tax on dividends (partially reclaimable). Pipeline execution risk if replacement drugs slow. China sales (~6% of revenue) exposed to government pricing pressure. High R&D spend required to sustain pipeline.",
          ct:"28 consecutive years of dividend increases — longest streak of any position in this portfolio. 52% payout ratio = massively well-covered. Kisqali grew 62% to $3.5B (breast cancer market leader). Kesimpta +41% to $3.2B. Core margin reached 40%. Up to USD 10B share buyback. FDA approvals for Rhapsido and ianalumab — two potential multi-blockbusters through 2030+. AA-/Aa3 credit rating.",
          writeup:"Novartis is the pharma equivalent of Parkway Life REIT — near-certainty income with real growth, backed by the highest credit quality. 28 consecutive years of dividend increases since its creation in 1996 — the longest unbroken streak of any position in your entire portfolio.\n\nThe 'take this or die' thesis is embodied across Novartis's core portfolio. Entresto treats heart failure — patients who stop taking it face rapid cardiac decompensation and death. Kisqali treats HR+/HER2- breast cancer — the most common form — and has achieved market-leading new prescription share across both metastatic and early settings. Kesimpta treats relapsing multiple sclerosis. Pluvicto is a radioligand therapy for metastatic prostate cancer. Cosentyx treats severe psoriasis and arthritis with $8B+ peak sales guided.\n\nFY2025 delivered high single-digit sales growth with core operating margin reaching 40%, despite the largest patent expiry in Novartis history (Entresto US generics). The replacement engine is working: Kisqali (+62%), Kesimpta (+41%), Pluvicto (+33%), and Scemblix (+85%) are growing fast enough to more than offset genericisation. Management expects to grow through this patent cliff in 2026.\n\nThe financials are fortress-grade: AA-/Aa3 credit rating (one of the highest in pharma), 52% payout ratio providing massive dividend coverage, and an active USD 10B share buyback reducing share count. The 5-year dividend growth rate of 4.4% should accelerate as the new growth drivers scale.\n\nAt ~3% yield, this isn't a high-income play — it's a high-quality compounding machine in the world's safest currency. Combined with BKW, this brings your CHF allocation to meaningful levels, providing genuine currency diversification against AUD/SGD concentration."},
        {tk:"ROG.SW",nm:"Roche Holding AG",ccy:"CHF",fl:"🇨🇭",al:25000,tag:"Oncology / Diagnostics",lk:"https://www.google.com/finance/quote/ROG:SWX",int:false,mgr:"Roche (founding family control)",src:"ai",
          m:{pv:"~CHF 200B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Patent/Pipeline",ge:"Moderate",nt:"—",yl:"~2.7-2.8%",hd:"—",rt:"—"},
          tn:["Tecentriq (cancer)","Hemlibra (haemophilia)","Ocrevus (MS)","Phesgo (breast cancer)","Diagnostics division"],
          rk:"Dividend growth of only 1.3% over 5 years — glacial. Payout ratio 82% leaves little headroom. Dual-class share structure (founding family controls voting). Biosimilar erosion on legacy oncology drugs (Avastin, Herceptin, Rituxan). Diagnostics division adds complexity. Triples CHF pharma exposure if combined with Novartis.",
          ct:"25 consecutive years without a dividend cut. FY2025 7% sales growth at constant currencies, 11% core EPS growth. Strong pipeline: Vabysmo (eye disease), Columvi (lymphoma), next-gen obesity programme. Diagnostics provides unique vertical integration. Proposed CHF 9.80 per share dividend for 2025.",
          writeup:"Roche is the world's largest biotech company and a diagnostics powerhouse, with a unique integrated model: it develops drugs AND the companion diagnostics to identify which patients will benefit. This vertical integration creates a competitive moat that no pure pharma company can replicate.\n\nThe 'essential medicine' case is strong across Roche's portfolio. Hemlibra treats haemophilia — patients bleed without it. Ocrevus treats relapsing and primary progressive MS. Phesgo treats HER2-positive breast cancer. Tecentriq is an immuno-oncology backbone treatment.\n\nFY2025 saw 7% sales growth at constant currencies with 11% core EPS growth — solid execution. The pipeline includes Vabysmo (already a blockbuster in wet AMD), Columvi (lymphoma), and an early-stage GLP-1 obesity programme that could be transformative.\n\n25 consecutive years without a dividend cut, but the growth rate is where Roche falls short: only 1.3% annually over 5 years vs Novartis's 4.4%. The 82% payout ratio also leaves less room for increases. The founding Hoffmann/Oeri family controls the company through a dual-class structure, which provides governance stability but limits shareholder influence.\n\nRoche is included as the complementary Swiss pharma position — where Novartis is the growth compounder, Roche is the stable dividend payer with diagnostics diversification. Together they provide broad exposure to life-sustaining medicine across oncology, neuroscience, haematology, and immunology. Size it smaller than Novartis to reflect the lower conviction on dividend growth."},
        {tk:"CSL.AX",nm:"CSL Limited",ccy:"AUD",fl:"🇦🇺",al:28000,tag:"Plasma / Vaccines / Iron",lk:"https://www.google.com/finance/quote/CSL:ASX",int:false,mgr:"CSL (interim CEO Gordon Naylor)",src:"ai",
          m:{pv:"~A$59B mkt cap",pr:"300+ plasma centres",oc:"Operational",wa:"Patent/Regulatory",ge:"~1.8x D/EBITDA",nt:"—",yl:"~2.7%",hd:"—",rt:"—"},
          tn:["Immunoglobulin (immunodeficiency)","Albumin (liver/burns)","HEMGENIX (gene therapy)","Flu vaccines (Seqirus)","Iron therapies (Vifor)"],
          rk:"HIGHEST RISK in pharma basket. CEO departed suddenly Feb 2026, interim leadership. H1 FY26 NPAT plunged 81% (restructuring/impairments). Revenue fell 4% to US$8.3B. Seqirus vaccine spinoff delayed — US flu vaccination rates declining. Vifor iron therapies facing generic competition. Shares down 40% from highs. US Medicare Part D reforms creating reimbursement headwinds for plasma therapies.",
          ct:"World's irreplaceable plasma franchise — 300+ collection centres, decades to replicate. Plasma cost per litre down 15% from COVID peak. US$500-550M annual savings target by FY28 (60% of FY26 savings already achieved). A$750M share buyback expanded. Operating cash flow US$1.3B (+3% YoY). Immunoglobulin demand structurally growing (aging populations, expanded indications). HEMGENIX gene therapy for haemophilia B. Trading near 8-year lows = deep value if turnaround succeeds.",
          writeup:"CSL is the most intellectually compelling and most dangerous position in this portfolio. It is the world's largest plasma therapies company, collecting and fractionating human blood plasma into life-saving medicines. Patients with primary immunodeficiency — born without functioning immune systems — need immunoglobulin infusions every 3-4 weeks or they die from infections their bodies cannot fight. There is no synthetic substitute. There is no alternative.\n\nThe physical moat is extraordinary: 300+ plasma collection centres across the US, Europe, and China, connected to state-of-the-art fractionation plants. This infrastructure took decades and billions to build. No competitor can replicate it quickly — Grifols, Takeda, and Octapharma collectively still collect less plasma than CSL.\n\nBut the company is in crisis. The CEO departed suddenly in February 2026. H1 FY26 statutory net profit plunged 81% on restructuring charges and impairments. Revenue fell 4% to US$8.3B. The Seqirus vaccine business is struggling with declining US flu vaccination rates. The Vifor iron therapy division faces generic competition. Shares have fallen from A$290+ to around A$155 — a 46% decline.\n\nStrip away the noise, and the underlying engine is bruised but not broken. Operating cash flow rose 3% to US$1.3B. Plasma costs per litre are down 15% from COVID peaks. The restructuring targets US$500-550M in annual savings. The expanded buyback signals management confidence at these levels.\n\nThe dividend yield has risen to ~2.7% — modest, but CSL has historically been a capital growth story. The 10-year dividend history is stable (never cut, grew from A$1.72 to A$4.13), and if the turnaround succeeds, dividend growth should resume. This is a contrarian bet on buying the world's irreplaceable plasma franchise at a multi-year low. Size it small — A$28K — and treat it as an option on recovery."},
      ]},
    {id:"food_staples",title:'"People Have to Eat"',sub:"Global Food & Consumer Staples",icon:"🍽️",conviction:3,color:P.amb,
      desc:"Food consumption is the most non-negotiable human expenditure. In recessions, people trade down from restaurants to home cooking — which increases supermarket and packaged food volumes. The best food companies own brands so deeply embedded in daily life that consumers buy them automatically: the same coffee every morning, the same cooking oil every dinner, the same pet food every week. Brand loyalty in food translates into pricing power, and pricing power translates into dividend growth.",
      items:[
        {tk:"NESN.SW",nm:"Nestlé SA",ccy:"CHF",fl:"🇨🇭",al:28000,tag:"Coffee / Petcare / Nutrition",lk:"https://www.google.com/finance/quote/NESN:SWX",int:false,mgr:"Nestlé (Philipp Navratil, CEO)",src:"ai",
          m:{pv:"CHF 89.5B rev",pr:"Multi-brand",oc:"Operational",wa:"Brand/Franchise",ge:"Moderate",nt:"—",yl:"~3.9-4.2%",hd:"—",rt:"AA"},
          tn:["Nescafé (#1 coffee)","Purina (#1 pet food)","KitKat","Maggi","Gerber","Nespresso"],
          rk:"Net profit fell 17% in FY2025 to CHF 9.0B. Third CEO in two years raises governance concerns. Global infant formula recall across 60+ countries — criminal complaints filed in France. Selling ice cream and water divisions narrows portfolio. US 39% tariff on Swiss goods. China weakness. 76% payout ratio less headroom than Novartis. UTOP margin compressed to 16.1%.",
          ct:"29+ consecutive years of dividend payments with no cuts. CHF 4.2% yield — highest of any Swiss blue-chip in your portfolio. Coffee (Nescafé, Nespresso) grew 7.5% organically — world's #1 brand. Petcare structural growth (people spend more on pets every year). 16,000 job cuts targeting CHF 3B savings by 2027. Restructuring to 4 core businesses (Coffee, Petcare, Nutrition, Food & Snacks). Share price down 35% from 2022 highs = value entry. Q3 2025 organic growth accelerated to 4.3%, beating expectations.",
          writeup:"Nestlé is the world's largest food company. Nescafé is the world's number one coffee brand. Purina is the world's number one pet food brand. KitKat, Maggi, Nespresso, Gerber — these brands are in kitchens and convenience stores on every continent. Combined they account for CHF 89.5 billion in annual sales across 188 countries.\n\nThe 'people have to eat' thesis is simple but powerful. In recessions, restaurant spending falls but grocery spending rises. In inflationary environments, Nestlé passes through price increases — 2.8% pricing contribution to FY2025 organic growth. The brands are so embedded in consumer habits that switching costs are psychological, not financial. Nobody comparison-shops instant coffee brands during a recession.\n\nThe company is mid-turnaround under its third CEO in two years, Philipp Navratil. He's narrowing Nestlé to four core businesses: Coffee, Petcare, Nutrition, and Food & Snacks (approximately 70% of sales). The ice cream business is being sold to Froneri. The water division (approximately EUR 5B) is being divested. 16,000 jobs are being cut to generate CHF 3B in savings by 2027.\n\nThe turnaround is showing early signs of working: Q3 2025 organic growth accelerated to 4.3% (beating analyst expectations of 3.3%), driven by strong coffee and confectionery performance. Real internal growth turned positive for the first time in quarters.\n\nHowever, significant risks remain. Net profit fell 17% in FY2025 to CHF 9.0 billion. A global infant formula recall across 60+ countries has created reputational and financial headwinds that will drag into 2026. The third CEO in two years raises legitimate governance questions.\n\nThe investment case rests on buying the world's most iconic food portfolio at a 35% discount to 2022 highs, collecting a 4.2% yield (the highest CHF yield in your portfolio), and betting that restructuring restores margins to their historical 17%+ level. The 29-year dividend streak has survived world wars, pandemics, and multiple CEO changes — it can survive a formula recall."},
        {tk:"F34.SI",nm:"Wilmar International",ccy:"SGD",fl:"🇸🇬",al:25000,tag:"Palm Oil / Edible Foods / Sugar",lk:"https://www.google.com/finance/quote/F34:SGX",int:false,mgr:"Wilmar (Kuok Khoon Hong, Chairman)",src:"ai",
          m:{pv:"~S$21.5B mkt cap",pr:"500+ plants",oc:"Operational",wa:"Commodity/Brand",ge:"Moderate",nt:"—",yl:"~4.0-4.3%",hd:"—",rt:"—"},
          tn:["Arawana (#1 China cooking oil)","Sania (Indonesia)","Fortune (India)","Palm oil refining","Sugar","Flour"],
          rk:"HIGHEST RISK in food basket. Dividend payments volatile over past 10 years. Posted Q3 2025 loss. Commodity price swings (palm oil, sugar, soybeans) create earnings volatility. Cash payout ratio 833% — dividends not well covered by cash flows. ESG concerns around palm oil deforestation. Indonesia regulatory risk (export levies, biodiesel mandates). China consumer slowdown affecting edible oil demand.",
          ct:"Asia's largest agribusiness group — 30%+ market share in palm oil refining. 100,000 employees across 50+ countries. Arawana is China's #1 cooking oil brand. Integrated from plantation to retail shelf = margin capture at every stage. Current yield 4.3% above historical average of 3.6%. India expansion (triple edible oil sales by 2027). Biodiesel demand structural tailwind. P/E of 9.2x well below 5-year average of 12.5x.",
          writeup:"Wilmar International is Asia's food supply chain incarnate. From palm oil plantations in Indonesia and Malaysia, to crushing and refining facilities, to consumer brands on supermarket shelves across China, India, and Southeast Asia — Wilmar controls the entire value chain of how 3+ billion people cook their food.\n\nThe 'essential' argument is undeniable: palm oil is the most consumed vegetable oil on earth. It's in cooking oil, instant noodles, margarine, soap, cosmetics, biodiesel. Wilmar's consumer brands are kitchen staples across Asia's most populous nations: Arawana is the number one cooking oil in China, Sania dominates Indonesia, Fortune leads in India.\n\nThe integrated model is Wilmar's competitive advantage — by controlling everything from plantation to consumer shelf, the company captures margin at every step. When palm oil prices rise, upstream profits offset downstream margin pressure. When prices fall, downstream processing margins expand. This integration provides some natural hedging against commodity cycles.\n\nHowever, 'some' is the operative word. Wilmar's earnings remain genuinely volatile — it posted a loss in Q3 2025, and dividend payments have been inconsistent over the past decade. The cash payout ratio of 833% at last check means dividends were not covered by cash flows, a red flag for income investors.\n\nThis is the highest-risk position in the food basket, included because the 'essential food infrastructure' thesis is structurally correct and the current valuation (9.2x P/E, 4.3% yield above historical average) provides margin of safety. Size it accordingly — S$25K reflects the thesis merit tempered by execution risk. If earnings stabilise and dividends become more consistent, this is a position to grow over time."},
        {tk:"WOW.AX",nm:"Woolworths Group",ccy:"AUD",fl:"🇦🇺",al:20000,tag:"Supermarkets / Grocery Retail",lk:"https://www.google.com/finance/quote/WOW:ASX",int:false,mgr:"Woolworths Group (internal)",src:"ai",
          m:{pv:"~A$38.8B mkt cap",pr:"1,000+ stores",oc:"Operational",wa:"Consumer/Staples",ge:"Low",nt:"—",yl:"~2.7-3.2%",hd:"—",rt:"—"},
          tn:["Australian grocery (35% mkt share)","Big W (discount dept)","PFD (foodservice)","1,000+ supermarkets"],
          rk:"Dividend growth negative over past 3 years (-2.25% average). Yield only 2.7-3.2% — thin for income mandate. ACCC scrutiny on pricing practices (cost of living political pressure). Competition from Aldi and Costco gaining share. Big W discount department stores cyclical and lower-margin. E-commerce investment compresses near-term margins.",
          ct:"35% of Australian grocery market — structural duopoly with Coles. Fully franked dividends. Supermarket spending resilient through all economic cycles — people don't stop eating. Online grocery growing rapidly (+20% pa). Cost-of-living environment actually benefits grocery (trade-down from restaurants). FY26 dividend expected ~91c (3.2% yield). Potential for margin recovery as inflation eases.",
          writeup:"Woolworths is Australia's largest supermarket operator with approximately 35% of the grocery market. Together with Coles, they form a structural duopoly — a position so dominant that no competitor has meaningfully challenged it in decades. Aldi has grown but plateaued at roughly 10% share. Costco operates just 15 warehouses nationally.\n\nThe 'essential' thesis is self-evident: Australians spend approximately A$130 billion annually on groceries. This spending is the last thing cut in a recession — people stop dining out and cook at home instead, which actually increases supermarket volumes. Woolworths' revenue barely dipped even during COVID lockdowns.\n\nHowever, for your specific income mandate, Woolworths has limitations. The dividend yield is only 2.7-3.2%, and the 3-year dividend growth rate is actually negative (-2.25%). This reflects margin pressure from competition, cost-of-living political scrutiny, and investment in online capabilities. The Australian Competition and Consumer Commission has been increasingly aggressive on grocery pricing, creating regulatory overhang.\n\nWoolworths is included as the smallest position in the food basket — A$20K — because the grocery duopoly moat is genuinely impregnable and fully franked dividends have tax advantages for Australian income. But this is a capital preservation play rather than an income growth engine. If dividend growth turns positive (expected FY27), conviction would increase."},
      ]},
  ]},
];

const gsData = [
  {assetType:"reit", theses:[
    {id:"gs_sg_reit",title:"Singapore Core REITs",sub:"Goldman Sachs Singapore REIT Picks",icon:"🏙️",conviction:2,color:P.acc,
      desc:"Goldman's Singapore REIT picks focus on the highest-quality, largest-cap names on SGX — CapitaLand Ascendas (industrial/DC), CapitaLand Integrated Commercial Trust (retail/office), and Keppel DC REIT (pure-play data centres). These form the backbone of any SGD income portfolio.",
      items:[
        {tk:"A17U.SI",nm:"CapitaLand Ascendas REIT",ccy:"SGD",fl:"🇸🇬",al:0,tag:"Industrial / Data Centres",lk:"https://www.google.com/finance/quote/A17U:SGX",int:false,mgr:"CapitaLand",src:"original",
          m:{pv:"S$17.7B",pr:"229",oc:"91.8%",wa:"3.7yr",ge:"37.4%",nt:"~S$2.50",yl:"~5.5%",hd:"~80%",rt:"A3"},tn:["~1,790 tenants","20+ industries"],rk:"US occupancy 87.3%. Gearing 37.4%.",ct:"+9.5% rental reversions. DC allocation growing.",writeup:"Singapore's first and largest REIT. A3 rated, 229 properties, 1,790 tenants across 20+ industries. The bedrock S-REIT position."},
        {tk:"C38U.SI",nm:"CapitaLand Integrated Commercial Trust",ccy:"SGD",fl:"🇸🇬",al:0,tag:"Retail / Office",lk:"https://www.google.com/finance/quote/C38U:SGX",int:false,mgr:"CapitaLand",src:"ai",
          m:{pv:"S$27.4B",pr:"26",oc:"97.2%",wa:"~4yr",ge:"~39%",nt:"—",yl:"~4.8%",hd:"~78%",rt:"A2"},tn:["Temasek","UNIQLO","NTUC","Office tenants"],rk:"Office/retail exposure. Singapore concentration. Gearing ~39%.",ct:"FY25 DPU 11.58¢ (+6.4% YoY). CapitaSpring acquisition. Bukit Panjang sold at 165% premium. 5yr DPU CAGR 5.8%.",writeup:"Singapore's largest REIT by AUM (S$27.4B). 26 prime properties including iconic malls (Raffles City, Plaza Singapura, VivoCity-adjacent) and Grade A offices. FY25 DPU jumped 6.4% to 11.58¢. The merger of CapitaLand Mall Trust and Commercial Trust created a diversified commercial juggernaut with 97.2% occupancy."},
        {tk:"AJBU.SI",nm:"Keppel DC REIT",ccy:"SGD",fl:"🇸🇬",al:0,tag:"Pure-Play Data Centres",lk:"https://www.google.com/finance/quote/AJBU:SGX",int:false,mgr:"Keppel Ltd",src:"ai",
          m:{pv:"S$6.3B",pr:"23 DCs",oc:"95.8%",wa:"4.7yr",ge:"35.3%",nt:"~S$1.70",yl:"~4.4%",hd:"76% fixed",rt:"—"},tn:["Hyperscalers (69%)","Enterprise","Colocation"],rk:"~1.5x P/B premium. 4.7yr WALE.",ct:"AI demand. Singapore moratorium = pricing power. 45% rental reversions.",writeup:"Asia's premier pure-play data centre REIT. 23 DCs, S$6.3B AUM. AI-driven demand + Singapore moratorium = extraordinary pricing power with 45% rental reversions in FY25."},
      ]},
  ]},
  {assetType:"equity", theses:[
    {id:"gs_eu_util",title:"European Grid & Utilities",sub:"Goldman Sachs European Utilities Coverage",icon:"⚡",conviction:2,color:P.orn,
      desc:"Goldman's European utilities basket spans the full spectrum: regulated grid operators (National Grid, E.ON, Elia, Snam), integrated utilities (Iberdrola, Enel, Engie, SSE, RWE, Centrica), renewable developers (Nordex, Vestas, Solaria), water/waste (Veolia), and Greek recovery (PPC). The sector benefits from €114B+ annual infrastructure investment, AI-driven electricity demand growth, and regulated returns. Median dividend yield ~4.4%.",
      items:[
        {tk:"CNA.LN",nm:"Centrica plc",ccy:"GBP",fl:"🇬🇧",al:0,tag:"Integrated Energy / British Gas",lk:"https://www.google.com/finance/quote/CNA:LON",int:false,mgr:"Centrica",src:"ai",
          m:{pv:"~£8B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Retail/Infra",ge:"Low",nt:"—",yl:"~2.9%",hd:"—",rt:"—"},tn:["British Gas","Nuclear (20%)","Spirit Energy","Bord Gáis"],rk:"Dividend cut in 2020 (COVID). Energy retail margin compression. Gas price volatility. UK political risk.",ct:"FY25 dividend 5.5p (+22% YoY). £1.4B EBITDA. Infrastructure pivot (Rough gas storage, nuclear). £0.7B+ capex 2026.",writeup:"UK's largest energy retailer (British Gas). Restructured from troubled conglomerate to lean infrastructure-plus-retail operator. FY25 dividend rose 22% to 5.5p per share, but dividend history includes a 2020 cut."},
        {tk:"EOAN.GR",nm:"E.ON SE",ccy:"EUR",fl:"🇩🇪",al:0,tag:"Regulated Networks / Retail",lk:"https://www.google.com/finance/quote/EOAN:ETR",int:false,mgr:"E.ON",src:"ai",
          m:{pv:"~€38B mkt cap",pr:"Networks/Retail",oc:"Operational",wa:"Regulated",ge:"Moderate",nt:"—",yl:"~4.5%",hd:"—",rt:"—"},tn:["German grid","Swedish grid","UK retail","Renewables"],rk:"German regulatory framework changes. UK retail competitive. Capex pressure from grid expansion.",ct:"Networks EBITDA growing from regulated asset base expansion. Dividend growth guided mid-single digit. Europe's largest electricity distribution operator.",writeup:"Europe's largest electricity distribution operator. Pure-play regulated networks + retail energy. German grid expansion is a multi-decade growth driver. Steady ~4.5% yield with mid-single-digit dividend growth guidance."},
        {tk:"ELI.BB",nm:"Elia Group",ccy:"EUR",fl:"🇧🇪",al:0,tag:"Transmission Grid Operator",lk:"https://www.google.com/finance/quote/ELI:EBR",int:false,mgr:"Elia",src:"ai",
          m:{pv:"~€8B mkt cap",pr:"Grid",oc:"Regulated",wa:"Regulated",ge:"Moderate",nt:"—",yl:"~1.8%",hd:"—",rt:"—"},tn:["Belgian TSO","50Hertz (German TSO)","WindGrid (offshore)"],rk:"Low yield ~1.8%. Heavy capex. Regulatory risk on allowed returns. Belgium/Germany concentration.",ct:"Owns 50Hertz (German transmission). Offshore wind grid connector (WindGrid). Regulated returns inflation-linked. €10B+ investment plan.",writeup:"Belgian/German transmission system operator. Owns 50Hertz, one of Germany's four TSOs. Pure regulated returns from essential grid infrastructure. Low yield but high growth from massive offshore wind and interconnector investment."},
        {tk:"ENEL.IM",nm:"Enel SpA",ccy:"EUR",fl:"🇮🇹",al:0,tag:"Integrated Utility / Renewables",lk:"https://www.google.com/finance/quote/ENEL:BIT",int:false,mgr:"Enel",src:"ai",
          m:{pv:"~€72B mkt cap",pr:"43 countries",oc:"Operational",wa:"Mixed",ge:"Moderate",nt:"—",yl:"~5.7%",hd:"—",rt:"—"},tn:["70M+ grid users","Renewables","Retail","LatAm operations"],rk:"LatAm FX exposure. Italian regulatory complexity. Debt levels. Weather-dependent hydro/wind.",ct:"€17.3B EBITDA. 5.7% yield at 12.3x P/E. €8B capacity for additional buybacks. Deleveraging ahead of schedule. Net profit +26% YoY.",writeup:"World's largest private electricity utility. 70M+ grid users across 43 countries. 5.7% yield with potential for additional capital returns. Deleveraging + margin improvement story."},
        {tk:"ENGI.FP",nm:"Engie SA",ccy:"EUR",fl:"🇫🇷",al:0,tag:"Integrated Utility / Gas / Renewables",lk:"https://www.google.com/finance/quote/ENGI:EPA",int:false,mgr:"Engie",src:"ai",
          m:{pv:"~€40B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Mixed",ge:"Moderate",nt:"—",yl:"~6.4%",hd:"—",rt:"—"},tn:["French gas/power","Renewables","Flexible generation","Nuclear (Belgium)"],rk:"Belgian nuclear phase-out complexity. French government 24% stake = political influence. Gas transition risk.",ct:"Highest flexible generation exposure (22%) among peers = captures price volatility. 6.4% yield at 11.7x P/E. Jefferies top pick.",writeup:"French utility giant with 6.4% yield — highest among Goldman's major European utilities. 22% flexible generation exposure positions Engie to capture volatility as renewables penetration increases. Jefferies top utility pick."},
        {tk:"IBE.SM",nm:"Iberdrola SA",ccy:"EUR",fl:"🇪🇸",al:0,tag:"Renewables / Networks Leader",lk:"https://www.google.com/finance/quote/IBE:BME",int:false,mgr:"Iberdrola",src:"ai",
          m:{pv:"~€90B mkt cap",pr:"Global",oc:"Operational",wa:"Mixed",ge:"Moderate",nt:"—",yl:"~4.1%",hd:"—",rt:"—"},tn:["ScottishPower","Avangrid (US)","Neoenergia (Brazil)","Networks"],rk:"Share price +35% in 2025 — not cheap. 17.8x P/E above peers. Spanish nuclear phase-out debate. US/Brazil FX exposure.",ct:"53% investment in networks. Net profit +26% to €2B. 8% DPS growth. 7.5% EPS CAGR through FY28. Europe's #1 in renewable PPAs for 3 consecutive years.",writeup:"Europe's leading renewable/network utility. Impressive track record: 7.5% EPS CAGR guided through 2028. Net profit surged 26%. But at 17.8x P/E after 35% share price rally, the risk-reward is more balanced."},
        {tk:"NG.LN",nm:"National Grid plc",ccy:"GBP",fl:"🇬🇧",al:0,tag:"Regulated Grid / Transmission",lk:"https://www.google.com/finance/quote/NG.:LON",int:false,mgr:"National Grid",src:"ai",
          m:{pv:"~£46B mkt cap",pr:"UK/US Grid",oc:"Regulated",wa:"Regulated",ge:"High",nt:"—",yl:"~4.8%",hd:"—",rt:"—"},tn:["UK electricity transmission","UK gas distribution","US distribution (NE)"],rk:"£7B rights issue (2024) diluted shareholders. High gearing. US regulatory complexity. UK RIIO framework changes.",ct:"£2.3B H1 operating profit (+13%). Regulated asset base growing 19% CAGR through 2030 (highest among peers). RIIO-T3 higher returns from 2026. Morningstar top pick.",writeup:"UK/US regulated electricity and gas grid. Morningstar and Jefferies both name National Grid as a top pick. Regulated asset base growing at 19% CAGR — highest among European peers. RIIO-T3 regulatory regime from 2026 offers higher allowed returns."},
        {tk:"NDX1.GR",nm:"Nordex SE",ccy:"EUR",fl:"🇩🇪",al:0,tag:"Wind Turbine Manufacturer",lk:"https://www.google.com/finance/quote/NDX1:ETR",int:false,mgr:"Nordex",src:"ai",
          m:{pv:"~€4B mkt cap",pr:"Manufacturer",oc:"Operational",wa:"Order book",ge:"Moderate",nt:"—",yl:"~0%",hd:"—",rt:"—"},tn:["Onshore wind turbines","Global installations","Acciona (30% stake)"],rk:"No dividend. Cyclical manufacturer not utility. Margin pressure from competition. Supply chain/input cost risk.",ct:"Onshore wind order backlog recovery. European wind buildout accelerating. Acciona 30% strategic stake. Turnaround from losses to profitability.",writeup:"GROWTH/TURNAROUND — not an income play. Onshore wind turbine manufacturer benefiting from European wind buildout. No dividend. Included in Goldman's coverage for capital appreciation potential, not income."},
        {tk:"PPC.GA",nm:"Public Power Corp.",ccy:"EUR",fl:"🇬🇷",al:0,tag:"Greek Integrated Utility",lk:"https://www.google.com/finance/quote/PPC:ATH",int:false,mgr:"PPC (Greek state)",src:"ai",
          m:{pv:"~€5B mkt cap",pr:"Greece/Romania",oc:"Operational",wa:"Mixed",ge:"Moderate",nt:"—",yl:"~3.5%",hd:"—",rt:"—"},tn:["Greek electricity","Lignite phase-out","Renewables buildout","Romania expansion"],rk:"Greek sovereign/political risk. Legacy coal assets. Regulatory uncertainty. Small market/liquidity.",ct:"Greek economy recovery story. Massive renewable energy pipeline replacing lignite. Romania expansion. Earnings recovery from energy crisis.",writeup:"Greek utility in transformation from lignite-heavy to renewables-led. Sovereign recovery play — benefiting from Greek economic normalisation and EU energy transition funding."},
        {tk:"RWE.GR",nm:"RWE AG",ccy:"EUR",fl:"🇩🇪",al:0,tag:"Renewables / Power Generation",lk:"https://www.google.com/finance/quote/RWE:ETR",int:false,mgr:"RWE",src:"ai",
          m:{pv:"~€26B mkt cap",pr:"Global",oc:"Operational",wa:"Mixed",ge:"Moderate",nt:"—",yl:"~3.5%",hd:"—",rt:"—"},tn:["Offshore wind","Onshore wind/solar","Flexible generation","Trading"],rk:"Offshore wind EBITDA declined (weak wind conditions). US IRA uncertainty. German coal exit. Project execution risk.",ct:"Thor/Nordseecluster stakes sold to Norges Bank. Diversified renewables portfolio. Trading operations strong. Share buyback programme.",writeup:"German utility transformed from coal giant to global renewables leader. Strong in offshore wind, onshore renewables, and flexible generation/trading. Recent weakness in wind conditions pressured earnings but long-term capacity buildout continues."},
        {tk:"SRG.IM",nm:"Snam SpA",ccy:"EUR",fl:"🇮🇹",al:0,tag:"Gas Infrastructure / TSO",lk:"https://www.google.com/finance/quote/SRG:BIT",int:false,mgr:"Snam (CDP Reti stake)",src:"ai",
          m:{pv:"~€17B mkt cap",pr:"Gas grid",oc:"Regulated",wa:"Regulated",ge:"Moderate",nt:"—",yl:"~5.5%",hd:"—",rt:"—"},tn:["Italian gas transmission","Gas storage","LNG terminals","Hydrogen-ready"],rk:"Gas transition risk (long-term demand decline). Italian regulatory framework. Debt levels. Limited growth beyond Italy.",ct:"Italy's gas transmission monopoly. 5.5% yield. Regulated returns with inflation linkage. Hydrogen-ready infrastructure. Essential energy security asset post-Ukraine.",writeup:"Italy's gas transmission monopoly operator. Pure regulated returns with ~5.5% yield. Infrastructure is hydrogen-ready, providing long-term optionality. Essential energy security asset for Europe."},
        {tk:"SLR.SM",nm:"Solaria Energia",ccy:"EUR",fl:"🇪🇸",al:0,tag:"Solar IPP",lk:"https://www.google.com/finance/quote/SLR:BME",int:false,mgr:"Solaria",src:"ai",
          m:{pv:"~€1.5B mkt cap",pr:"Solar",oc:"Operational",wa:"PPA-based",ge:"Moderate",nt:"—",yl:"~0%",hd:"—",rt:"—"},tn:["Spanish solar","Italian solar","Pipeline development"],rk:"No meaningful dividend. Small cap. Spanish solar pricing pressure. Project pipeline execution risk. Interest rate sensitive.",ct:"Large solar development pipeline. Spanish/Italian sun exposure. Falling module costs. PPA demand from corporates/utilities.",writeup:"GROWTH — not income. Spanish solar IPP with large development pipeline. No meaningful dividend. Pure capital appreciation bet on European solar buildout."},
        {tk:"SSE.LN",nm:"SSE plc",ccy:"GBP",fl:"🇬🇧",al:0,tag:"Integrated Utility / Renewables",lk:"https://www.google.com/finance/quote/SSE:LON",int:false,mgr:"SSE",src:"ai",
          m:{pv:"~£22B mkt cap",pr:"UK/Ireland",oc:"Operational",wa:"Mixed",ge:"Moderate",nt:"—",yl:"~3.8%",hd:"—",rt:"—"},tn:["SSEN Transmission","SSEN Distribution","SSE Renewables","SSE Thermal"],rk:"Offshore wind execution risk. UK regulatory changes. Weather dependence. Higher capex requirements.",ct:"Jefferies top pick. Regulated asset base 19% CAGR through 2030 (highest among peers). 17% upside + 20% total return implied. UK grid investment secular theme.",writeup:"Jefferies' preferred integrated European utility. Regulated asset base growing at 19% CAGR through 2030 — the fastest among all European peers. UK grid investment is a multi-decade theme driven by electrification, EVs, and heat pumps."},
        {tk:"VIE.FP",nm:"Veolia Environnement",ccy:"EUR",fl:"🇫🇷",al:0,tag:"Water / Waste / Environment",lk:"https://www.google.com/finance/quote/VIE:EPA",int:false,mgr:"Veolia",src:"ai",
          m:{pv:"~€24B mkt cap",pr:"Global",oc:"Operational",wa:"Concession/Contract",ge:"Moderate",nt:"—",yl:"~4.0%",hd:"—",rt:"—"},tn:["Water treatment","Waste management","Energy services","Hazardous waste"],rk:"French political/regulatory risk. Suez integration execution. Debt from acquisitions. Cyclical industrial waste volumes.",ct:"Morningstar 'significantly undervalued'. World's largest water/waste company post-Suez merger. Essential services with long-term concessions. Climate adaptation beneficiary.",writeup:"World's largest water and waste management company after absorbing Suez. Essential environmental services with long-term municipal concessions. Morningstar calls it 'significantly undervalued'. A climate adaptation play — as water stress and waste volumes rise globally, Veolia's services become more essential."},
        {tk:"VWS.DC",nm:"Vestas Wind Systems",ccy:"DKK",fl:"🇩🇰",al:0,tag:"Wind Turbine Manufacturer",lk:"https://www.google.com/finance/quote/VWS:CPH",int:false,mgr:"Vestas",src:"ai",
          m:{pv:"~DKK 130B mkt cap",pr:"Manufacturer",oc:"Operational",wa:"Order book",ge:"Low",nt:"—",yl:"~1.0%",hd:"—",rt:"—"},tn:["Onshore wind turbines","Offshore wind","Service contracts","Global leader"],rk:"Margin pressure from competition and input costs. Minimal dividend ~1%. Cyclical. Offshore wind project delays globally.",ct:"World's largest wind turbine manufacturer. Record order backlog. Service revenue growing. Essential for global energy transition. European wind buildout.",writeup:"World's largest wind turbine manufacturer. Minimal dividend (~1%) — this is a growth/infrastructure play, not income. Included in Goldman's coverage for exposure to the European energy transition. Record order backlog provides revenue visibility."},
      ]},
    {id:"gs_eu_pharma",title:"European Pharma & Biotech",sub:"Goldman Sachs European Pharma Coverage",icon:"💊",conviction:2,color:P.ros,
      desc:"Goldman's European pharma basket includes mega-cap dividend compounders (AstraZeneca, Novo Nordisk), turnaround stories (Bayer), biotech growth (BioNTech, Zealand Pharma), specialty dermatology (Galderma), and immunology specialists (UCB). The sector offers a mix of income, growth, and recovery plays across GBP, EUR, DKK, and CHF currencies.",
      items:[
        {tk:"AZN.LN",nm:"AstraZeneca plc",ccy:"GBP",fl:"🇬🇧",al:0,tag:"Oncology / Rare Disease",lk:"https://www.google.com/finance/quote/AZN:LON",int:false,mgr:"AstraZeneca",src:"ai",
          m:{pv:"~£170B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Patent/Pipeline",ge:"Low",nt:"—",yl:"~1.6%",hd:"—",rt:"—"},tn:["Tagrisso (lung)","Imfinzi (cancer)","Farxiga (diabetes)","Rare disease"],rk:"Low yield ~1.6%. China investigation overhang. Patent cliffs on key drugs. High valuation.",ct:"FY25 revenue +18% cc. Oncology pipeline one of industry's best. $80B+ revenue target by 2030. Recent upgrade by analysts.",writeup:"UK pharma giant with one of the industry's strongest oncology pipelines. FY25 revenue grew 18% at constant currencies. Low ~1.6% yield makes this a growth compounder rather than income play."},
        {tk:"BAYN.GR",nm:"Bayer AG",ccy:"EUR",fl:"🇩🇪",al:0,tag:"Pharma / Crop Science / Consumer",lk:"https://www.google.com/finance/quote/BAYN:ETR",int:false,mgr:"Bayer",src:"ai",
          m:{pv:"~€23B mkt cap",pr:"Multi-division",oc:"Operational",wa:"Patent/Pipeline",ge:"High",nt:"—",yl:"~0.5%",hd:"—",rt:"—"},tn:["Pharma","Crop Science (Monsanto)","Consumer Health","Roundup litigation"],rk:"HIGHEST RISK. Roundup/glyphosate litigation ($16B+ settlements). Dividend slashed to €0.11 (from €2.40). Massive debt. Pharma patent cliff (Xarelto, Eylea). Possible break-up.",ct:"Extreme deep value if litigation resolves. Crop Science is world-class asset. New CEO restructuring. Share price down ~75% from 2018 highs. Break-up could unlock value.",writeup:"DEEP VALUE / TURNAROUND — extreme risk position. Bayer slashed its dividend by 95% to fund Roundup litigation. This is a bet on litigation resolution + break-up value, not income."},
        {tk:"BNTX.US",nm:"BioNTech SE",ccy:"USD",fl:"🇩🇪",al:0,tag:"mRNA / Oncology Pipeline",lk:"https://www.google.com/finance/quote/BNTX:NASDAQ",int:false,mgr:"BioNTech",src:"ai",
          m:{pv:"~$25B mkt cap",pr:"Pipeline",oc:"Operational",wa:"Patent/Pipeline",ge:"Net cash",nt:"—",yl:"~0%",hd:"—",rt:"—"},tn:["COVID vaccine revenue declining","mRNA oncology pipeline","Immunotherapy","ADCs"],rk:"No dividend. COVID revenue cliff. Pipeline-stage oncology drugs = binary outcomes. Cash burn accelerating as R&D scales.",ct:"~€18B net cash position. mRNA cancer vaccines in Phase III. ADC pipeline growing. COVID cash provides multi-year runway without dilution.",writeup:"GROWTH/PIPELINE — no income. German mRNA biotech sitting on ~€18B cash from COVID vaccines, now deploying into oncology. Pure R&D pipeline bet with no dividend. Goldman coverage for capital appreciation."},
        {tk:"GALD.SW",nm:"Galderma Group",ccy:"CHF",fl:"🇨🇭",al:0,tag:"Dermatology / Aesthetics",lk:"https://www.google.com/finance/quote/GALD:SWX",int:false,mgr:"Galderma (EQT-backed)",src:"ai",
          m:{pv:"~CHF 28B mkt cap",pr:"Dermatology",oc:"Operational",wa:"Brand/Patent",ge:"Moderate",nt:"—",yl:"~0%",hd:"—",rt:"—"},tn:["Restylane (aesthetics)","Cetaphil (skincare)","Nemolizumab (eczema)","Sculptra"],rk:"No dividend (recent IPO 2024). High valuation. Competition from Allergan/AbbVie. Dermatology cyclicality.",ct:"World's largest pure-play dermatology company. Nemolizumab blockbuster potential. Medical aesthetics growing 10%+ annually. CHF listing provides currency diversification.",writeup:"GROWTH — no income. World's largest pure-play dermatology company (IPO 2024). Restylane, Cetaphil, and pipeline drug nemolizumab. Premium growth story in medical aesthetics, not an income position."},
        {tk:"NVO.US",nm:"Novo Nordisk A/S",ccy:"USD",fl:"🇩🇰",al:0,tag:"GLP-1 / Obesity / Diabetes",lk:"https://www.google.com/finance/quote/NVO:NYSE",int:false,mgr:"Novo Nordisk (Novo Holdings)",src:"ai",
          m:{pv:"~$350B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Patent/Pipeline",ge:"Low",nt:"—",yl:"~3.1%",hd:"—",rt:"—"},tn:["Ozempic (diabetes)","Wegovy (obesity)","Insulin portfolio","CagriSema (next-gen)"],rk:"Ozempic/Wegovy list price cuts announced (up to 50% by 2027). GLP-1 competition intensifying (Lilly, Amgen). Shares down ~50% from 2024 highs. Manufacturing capacity constraints.",ct:"Obesity is a $100B+ market opportunity. 3.1% yield with strong dividend growth history. CagriSema next-gen obesity drug. Dominant GLP-1 franchise. Price cuts may expand volume dramatically.",writeup:"The GLP-1/obesity mega-story — but shares have halved from 2024 highs after announcing Ozempic/Wegovy list price cuts of up to 50%. Yield has risen to ~3.1% as a result. This is the world's dominant obesity franchise with a 100B+ market opportunity, now available at a much more reasonable valuation. Goldman coverage spans both ADR and Copenhagen listing."},
        {tk:"UCB.BB",nm:"UCB SA",ccy:"EUR",fl:"🇧🇪",al:0,tag:"Immunology / Neurology",lk:"https://www.google.com/finance/quote/UCB:EBR",int:false,mgr:"UCB",src:"ai",
          m:{pv:"~€30B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Patent/Pipeline",ge:"Moderate",nt:"—",yl:"~1.0%",hd:"—",rt:"—"},tn:["Bimzelx (psoriasis)","Cimzia (Crohn's)","Briviact (epilepsy)","Evenity (osteoporosis)"],rk:"Low yield ~1%. Cimzia facing biosimilar competition. High R&D spend. Single-product concentration risk (Bimzelx).",ct:"Bimzelx blockbuster launch — fastest-growing biologic in dermatology. Rare disease pipeline. Belgian mid-cap pharma outperformer.",writeup:"Belgian immunology/neurology specialist. Bimzelx (psoriasis) is the fastest-growing biologic in dermatology. Low yield (~1%) — growth over income. Goldman coverage for pipeline-driven upside."},
        {tk:"ZEAL.DC",nm:"Zealand Pharma A/S",ccy:"DKK",fl:"🇩🇰",al:0,tag:"GLP-1 / Obesity Pipeline",lk:"https://www.google.com/finance/quote/ZEAL:CPH",int:false,mgr:"Zealand Pharma",src:"ai",
          m:{pv:"~DKK 40B mkt cap",pr:"Pipeline",oc:"Clinical-stage",wa:"Pipeline",ge:"Net cash",nt:"—",yl:"~0%",hd:"—",rt:"—"},tn:["Petrelintide (obesity)","Survodutide (MASH/obesity)","GLP-1 pipeline"],rk:"No revenue from obesity drugs yet. Pipeline-stage = binary outcomes. Cash burn. Competition from Novo/Lilly dominant.",ct:"Next-gen obesity pipeline. Petrelintide Phase III. Danish biotech in GLP-1 sweet spot. Potential acquisition target.",writeup:"PIPELINE/GROWTH — no income. Danish biotech with next-gen obesity pipeline competing with Novo Nordisk and Lilly. Pure speculative growth position, no dividend."},
      ]},
    {id:"gs_asia_pharma",title:"Asia/Australia Pharma",sub:"Goldman Sachs Asia Healthcare Coverage",icon:"🏥",conviction:3,color:P.cyn,
      desc:"Goldman's Asia pharma coverage focuses on China's pharmaceutical innovation wave and Australia's plasma monopoly (CSL). The Chinese names — Hansoh, CSPC, Sino Biopharma, China Medical System, CStone, Tigermed — represent the next generation of Chinese drug developers benefiting from NRDL inclusion, GLP-1 competition, and clinical trial outsourcing growth. Higher risk but higher growth potential than Western pharma.",
      items:[
        {tk:"0867.HK",nm:"China Medical System",ccy:"HKD",fl:"🇭🇰",al:0,tag:"Pharma Distribution / Licensing",lk:"https://www.google.com/finance/quote/0867:HKG",int:false,mgr:"CMS Holdings",src:"ai",
          m:{pv:"~HK$30B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"License/Dist.",ge:"Low",nt:"—",yl:"~4.5%",hd:"—",rt:"—"},tn:["Licensed drugs (MNC partnerships)","Chinese distribution","Cardiovascular","Oncology"],rk:"China pharma regulatory risk. VBP (volume-based procurement) pricing pressure. MNC partnership dependency. Hong Kong listing liquidity.",ct:"High-margin licensing model. Strong dividend payer among HK pharma. Cardiovascular and oncology portfolio. Cash-rich balance sheet.",writeup:"China's leading pharmaceutical licensing and distribution company. Licenses drugs from global MNCs for Chinese market. Unusual among Chinese pharma for its ~4.5% dividend yield and consistent payouts. Cash-rich balance sheet."},
        {tk:"CSL.AX",nm:"CSL Limited",ccy:"AUD",fl:"🇦🇺",al:0,tag:"Plasma / Vaccines / Iron",lk:"https://www.google.com/finance/quote/CSL:ASX",int:false,mgr:"CSL (interim CEO)",src:"ai",
          m:{pv:"~A$59B mkt cap",pr:"300+ plasma centres",oc:"Operational",wa:"Patent/Regulatory",ge:"~1.8x D/EBITDA",nt:"—",yl:"~2.7%",hd:"—",rt:"—"},tn:["Immunoglobulin","Albumin","HEMGENIX","Flu vaccines","Iron therapies"],rk:"CEO departed Feb 2026. H1 NPAT -81%. Seqirus spinoff delayed. Shares -40% from highs.",ct:"World's irreplaceable plasma franchise. Restructuring savings US$500-550M. A$750M buyback. 12x FCF at multi-year lows.",writeup:"World's largest plasma therapies company. In crisis (CEO exit, 81% profit drop) but the underlying plasma franchise is irreplaceable. Goldman coverage for recovery/deep value thesis."},
        {tk:"1093.HK",nm:"CSPC Pharmaceutical",ccy:"HKD",fl:"🇭🇰",al:0,tag:"Innovative & Generic Drugs",lk:"https://www.google.com/finance/quote/1093:HKG",int:false,mgr:"CSPC",src:"ai",
          m:{pv:"~HK$40B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Patent/Generic",ge:"Low",nt:"—",yl:"~4.0%",hd:"—",rt:"—"},tn:["NBP (stroke)","Oncology biosimilars","Innovative drugs pipeline","Generics"],rk:"China VBP pricing pressure on generics. Pipeline execution risk. Hong Kong listing. NRDL negotiation outcomes.",ct:"Transitioning from generics to innovative drugs. Strong R&D pipeline. Consistent dividend payer. Leading Chinese pharma by market cap.",writeup:"One of China's largest pharma companies transitioning from generics to innovative drugs. Consistent ~4% dividend yield unusual for Chinese pharma. Strong pipeline in oncology and neuroscience."},
        {tk:"2616.HK",nm:"CStone Pharmaceuticals",ccy:"HKD",fl:"🇭🇰",al:0,tag:"Oncology Biotech",lk:"https://www.google.com/finance/quote/2616:HKG",int:false,mgr:"CStone",src:"ai",
          m:{pv:"~HK$5B mkt cap",pr:"Pipeline",oc:"Clinical/Early commercial",wa:"Pipeline",ge:"Net cash",nt:"—",yl:"~0%",hd:"—",rt:"—"},tn:["Cejemly (PD-L1)","Oncology pipeline","Pfizer partnership"],rk:"No dividend. Loss-making biotech. Pipeline execution risk. Small cap. China regulatory uncertainty.",ct:"Pfizer partnership for sugemalimab (PD-L1). Growing oncology portfolio. Potential acquisition target.",writeup:"PIPELINE/GROWTH — no income. Chinese oncology biotech with Pfizer partnership. Loss-making, no dividend. Goldman coverage for pipeline optionality."},
        {tk:"3692.HK",nm:"Hansoh Pharmaceutical",ccy:"HKD",fl:"🇭🇰",al:0,tag:"CNS / Oncology / GLP-1",lk:"https://www.google.com/finance/quote/3692:HKG",int:false,mgr:"Hansoh (Zhong family 66%)",src:"ai",
          m:{pv:"~HK$170B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Patent/Pipeline",ge:"Net cash",nt:"—",yl:"~1.5%",hd:"—",rt:"—"},tn:["Aumolertinib (lung cancer)","GLP-1 pipeline (MSD deal)","CNS drugs","Anti-infectives"],rk:"China pharma regulatory risk. VBP pricing pressure. Family-controlled. GLP-1 competition fierce. Hong Kong listing.",ct:"China's largest psychotropic drug producer. MSD licensing deal for GLP-1. Aumolertinib blockbuster in lung cancer. R&D spend 19.4% of revenue. 70+ clinical trials.",writeup:"China's leading innovation-driven pharma company. MSD licensed its GLP-1 asset for global development. Aumolertinib is China's first original 3rd-gen EGFR-TKI. ~HK$170B market cap makes it one of the largest Chinese pharma names."},
        {tk:"1177.HK",nm:"Sino Biopharmaceutical",ccy:"HKD",fl:"🇭🇰",al:0,tag:"Oncology / Hepatitis / Respiratory",lk:"https://www.google.com/finance/quote/1177:HKG",int:false,mgr:"Sino Biopharma (Tse family)",src:"ai",
          m:{pv:"~HK$45B mkt cap",pr:"Multi-asset",oc:"Operational",wa:"Patent/Generic",ge:"Low",nt:"—",yl:"~3.0%",hd:"—",rt:"—"},tn:["Anlotinib (cancer)","Hepatitis portfolio","Respiratory","CT Pharma subsidiary"],rk:"China VBP pricing pressure. Anlotinib competition. Family-controlled governance. Regulatory risk.",ct:"One of China's top 5 pharma companies. Innovative drug revenue now >50% of total. Strong oncology franchise. Dividend payer among HK-listed Chinese pharma.",writeup:"Top-5 Chinese pharma company. Anlotinib (multi-cancer drug) is a blockbuster in China. Innovative drug revenue now exceeds 50% of total — demonstrating successful transition from generics. ~3% dividend yield."},
        {tk:"3347.HK",nm:"Hangzhou Tigermed",ccy:"HKD",fl:"🇭🇰",al:0,tag:"Clinical Trial CRO",lk:"https://www.google.com/finance/quote/3347:HKG",int:false,mgr:"Tigermed",src:"ai",
          m:{pv:"~HK$30B mkt cap",pr:"CRO Services",oc:"Operational",wa:"Contract",ge:"Low",nt:"—",yl:"~2.0%",hd:"—",rt:"—"},tn:["Clinical trial management","Biostatistics","Regulatory consulting","China/Global CRO"],rk:"China biotech funding downturn reducing trial starts. Geopolitical risk (US-China tensions on clinical data). Competition from global CROs. Revenue cyclicality.",ct:"China's largest clinical CRO. Global expansion into emerging markets. Beneficiary of Chinese pharma innovation wave. Goldman Sachs coverage. Investment arm generates returns.",writeup:"China's largest clinical trial contract research organisation (CRO). A picks-and-shovels play on Chinese pharmaceutical innovation — regardless of which drugs succeed, Tigermed profits from running the trials. ~2% dividend yield with global expansion ambitions."},
      ]},
  ]},
];

const jbData = [
  {assetType:"reit", theses:[
    {id:"jb_us_luxury",title:"US Luxury & Specialty REITs",sub:"Julius Baer US REIT Recommendations",icon:"🏨",conviction:2,color:P.ros,
      desc:"Julius Baer's US REIT picks target luxury and high-end real estate exposure: premium malls (Simon Property), luxury apartments (AvalonBay), upper-upscale hotels (Host Hotels), Manhattan trophy offices (SL Green), and senior healthcare housing (Welltower). These names offer exposure to premium consumer demand, ageing demographics, and NYC office recovery. Median yield ~4.4%.",
      items:[
        {tk:"SPG.US",nm:"Simon Property Group",ccy:"USD",fl:"🇺🇸",al:0,tag:"Premium Malls & Outlets",lk:"https://www.google.com/finance/quote/SPG:NYSE",int:false,mgr:"Self-Managed",src:"ai",
          m:{pv:"$76B",pr:"195",oc:"95.2%",wa:"~6yr",ge:"~34%",nt:"~$135",yl:"~4.4%",hd:"~70%",rt:"A-"},tn:["Premium Outlets","The Mills","Luxury Retailers"],rk:"Rate-sensitive. E-commerce disruption risk. High payout ratio.",ct:"Record FFO 2025. $4B+ dev pipeline. 17M sqft leased. Dividend raised to $2.20/Q.",writeup:"World's largest mall REIT. S&P 100 member. 195 premium properties across North America and Asia plus 29% stake in Klépierre (260 European centres). Record 2025 FFO, 23 redevelopment projects completed. Dividend grew from $5.20 (COVID trough) back to $8.80 annualised. The luxury mall thesis — experiential retail, premium outlets, mixed-use — remains intact despite e-commerce."},
        {tk:"AVB.US",nm:"AvalonBay Communities",ccy:"USD",fl:"🇺🇸",al:0,tag:"Luxury Apartments",lk:"https://www.google.com/finance/quote/AVB:NYSE",int:false,mgr:"Self-Managed",src:"ai",
          m:{pv:"$25B",pr:"~300",oc:"96.5%",wa:"—",ge:"~32%",nt:"~$190",yl:"~4.0%",hd:"~95%",rt:"A-"},tn:["High-Barrier Markets","Coastal US","Premium Renters"],rk:"High payout ratio (~95%). Rate-sensitive. Supply risk in Sunbelt.",ct:"FY26 EPS guidance $11-$11.50. Dividend raised to $1.78/Q (+1.7%). 3yr consecutive increases.",writeup:"Premier US apartment REIT focused on high-barrier coastal markets (Boston, NYC, DC, Seattle, SF, Southern California). ~300 communities housing ~90,000 units. The structural US housing undersupply thesis drives occupancy and rent growth. FY25 EPS $2.85, beating estimates. Dividend raised for 3rd consecutive year. Long-term play on housing affordability crisis pushing premium renters to apartments."},
        {tk:"HST.US",nm:"Host Hotels & Resorts",ccy:"USD",fl:"🇺🇸",al:0,tag:"Luxury Hotels",lk:"https://www.google.com/finance/quote/HST:NASDAQ",int:false,mgr:"Self-Managed",src:"ai",
          m:{pv:"$13.6B",pr:"~80",oc:"~73%",wa:"—",ge:"~18%",nt:"~$22",yl:"~4.0%",hd:"~60%",rt:"BBB-"},tn:["Marriott","Hyatt","Four Seasons","Ritz-Carlton"],rk:"Cyclical. Travel demand sensitivity. Hurricane/pandemic risk.",ct:"FY26 EPS guidance $2.03-$2.11. RevPAR growth 2.5-4%. Dividend $0.20/Q maintained.",writeup:"Largest US lodging REIT owning ~80 luxury and upper-upscale hotels. Portfolio includes iconic brands — Marriott, Ritz-Carlton, Hyatt, Four Seasons, Westin. Beneficiary of revenge travel, business travel recovery, and luxury experiential spending. Dividend suspended during COVID, fully reinstated at $0.80/yr. Low gearing (18%) gives acquisition firepower. FY26 guidance well above consensus."},
        {tk:"SLG.US",nm:"SL Green Realty",ccy:"USD",fl:"🇺🇸",al:0,tag:"Manhattan Trophy Office",lk:"https://www.google.com/finance/quote/SLG:NYSE",int:false,mgr:"Self-Managed",src:"ai",
          m:{pv:"$2.6B",pr:"~30",oc:"~92%",wa:"~8yr",ge:"~50%",nt:"~$73",yl:"~8.4%",hd:"~75%",rt:"BB+"},tn:["One Vanderbilt","Trophy Office","Midtown Manhattan"],rk:"WFH headwind. High gearing ~50%. NYC office vacancy. 52-wk low near $36.",ct:"One Vanderbilt fully leased. Leasing momentum improving. Monthly dividend $0.26.",writeup:"Manhattan's largest office landlord with ~32M sqft. One Vanderbilt (93-storey supertall) is the crown jewel — fully leased and a NYC landmark. SLG trades at ~50% discount to NAV ($73 vs $37 price), reflecting WFH fears. But trophy NYC offices are seeing leasing recover while commodity space suffers. The deep value play — if office demand stabilises, this could double. Monthly dividend provides ~8.4% yield."},
        {tk:"WELL.US",nm:"Welltower",ccy:"USD",fl:"🇺🇸",al:0,tag:"Senior Healthcare Housing",lk:"https://www.google.com/finance/quote/WELL:NYSE",int:false,mgr:"Self-Managed",src:"ai",
          m:{pv:"$120B",pr:"2,000+",oc:"~86%",wa:"—",ge:"~28%",nt:"~$215",yl:"~1.4%",hd:"~59%",rt:"BBB+"},tn:["Senior Living","Assisted Living","Outpatient Medical","UK/Canada"],rk:"Low yield (1.4%). Regulatory/Medicare risk. Labour cost inflation.",ct:"Record Q4 2025. $11B invested in 2025. FY26 FFO guidance raised. All-time high $211. 61% total return in 2025.",writeup:"Dominant senior healthcare REIT at the intersection of ageing demographics and real estate. 2,000+ properties across US, UK, Canada. The silver economy mega-trend — 10,000 US baby boomers turning 65 daily — creates structural demand. Stock surged 61% in 2025 to all-time highs on record FFO and $11B investment. Low yield (1.4%) but exceptional capital appreciation. The growth REIT, not an income play."},
      ]},
    {id:"jb_sg_reit",title:"Singapore Core REITs",sub:"Julius Baer Singapore REIT Picks",icon:"🏙️",conviction:2,color:P.acc,
      desc:"Julius Baer's Singapore REIT recommendations mirror core institutional picks: CICT (retail/office), CapitaLand Ascendas (industrial/DC), Keppel DC (pure-play data centres), and Mapletree Pan Asia (pan-Asian commercial). Together they offer diversified SGD income exposure to Singapore's world-class REIT market with yields of 4.5-5.5%.",
      items:[
        {tk:"C38U.SI",nm:"CapitaLand Integrated Commercial Trust",ccy:"SGD",fl:"🇸🇬",al:0,tag:"Retail / Office",lk:"https://www.google.com/finance/quote/C38U:SGX",int:false,mgr:"CapitaLand",src:"ai",
          m:{pv:"S$27.4B",pr:"26",oc:"97.2%",wa:"~4yr",ge:"~39%",nt:"—",yl:"~5.2%",hd:"~78%",rt:"A2"},tn:["Raffles City","Plaza Singapura","VivoCity-adj"],rk:"Office/retail exposure. Gearing ~39%.",ct:"FY25 DPU 11.58¢ (+6.4% YoY). JB and Goldman both recommend.",writeup:"Also in Goldman portfolio. Singapore's largest REIT — 26 prime commercial properties. Julius Baer recommends as a core SGD income anchor. FY25 DPU grew 6.4% to 11.58¢."},
        {tk:"A17U.SI",nm:"CapitaLand Ascendas REIT",ccy:"SGD",fl:"🇸🇬",al:0,tag:"Industrial / Data Centres",lk:"https://www.google.com/finance/quote/A17U:SGX",int:false,mgr:"CapitaLand",src:"ai",
          m:{pv:"S$17.7B",pr:"229",oc:"91.8%",wa:"3.7yr",ge:"37.4%",nt:"~S$2.50",yl:"~5.4%",hd:"~80%",rt:"A3"},tn:["Industrial","DC","Logistics"],rk:"US occupancy 87.3%. Gearing 37.4%.",ct:"FY25 distributable income up. DC allocation growing. JB and Goldman both recommend.",writeup:"Also in Goldman and LAL portfolios. Singapore's first and largest REIT. A3 rated. Julius Baer recommends for industrial/DC secular growth tailwind."},
        {tk:"AJBU.SI",nm:"Keppel DC REIT",ccy:"SGD",fl:"🇸🇬",al:0,tag:"Pure-Play Data Centres",lk:"https://www.google.com/finance/quote/AJBU:SGX",int:false,mgr:"Keppel Ltd",src:"ai",
          m:{pv:"S$6.3B",pr:"23 DCs",oc:"95.8%",wa:"4.7yr",ge:"35.3%",nt:"~S$1.70",yl:"~4.5%",hd:"76% fixed",rt:"—"},tn:["Hyperscalers","AI Demand","SG Moratorium"],rk:"Premium valuation. DC moratorium risk.",ct:"AI demand tailwind. 45% rental reversions. JB and Goldman both recommend.",writeup:"Also in Goldman and LAL portfolios. Asia's premier pure-play DC REIT. Julius Baer recommends for AI-driven data centre demand thesis."},
        {tk:"N2IU.SI",nm:"Mapletree Pan Asia Commercial Trust",ccy:"SGD",fl:"🇸🇬",al:0,tag:"Pan-Asia Commercial",lk:"https://www.google.com/finance/quote/N2IU:SGX",int:false,mgr:"Mapletree",src:"ai",
          m:{pv:"S$7.5B",pr:"17",oc:"~94%",wa:"~3yr",ge:"~40%",nt:"~S$1.80",yl:"~5.5%",hd:"~90%",rt:"—"},tn:["VivoCity","MBC","mTower","Japan Offices","HK Festival Walk"],rk:"North Asia drag. HK/China weakness. FX exposure. Gearing ~40%.",ct:"VivoCity consistently outperforms. DPU ~8.0¢. Highest yielding major S-REIT at 5.5%.",writeup:"Formed in 2022 from Mapletree Commercial Trust + North Asia Commercial Trust merger. 17 properties across Singapore (VivoCity — top-performing mall, MBC, mTower), Hong Kong (Festival Walk), China, Japan, South Korea. VivoCity is the crown jewel driving ~40% of NPI. The pan-Asian diversification thesis is compelling but North Asian drag on valuations persists. At 5.5% yield, it's the highest-yielding major S-REIT in the JB picks."},
      ]},
  ]},
];

const PORTFOLIOS = [
  {id:"lal",label:"LAL Portfolio",icon:"👤",color:P.acc,desc:"Personal thesis-driven defensive income portfolio"},
  {id:"gs",label:"Goldman Sachs",icon:"🏛️",color:P.amb,desc:"Goldman Sachs recommended positions"},
  {id:"jb",label:"Julius Baer",icon:"🏦",color:P.prp,desc:"Julius Baer recommended US luxury REITs and Singapore core REITs"},
];

function ChartTip({active,payload,label,pc,cc}){
  if(!active||!payload?.length)return null;
  return(<div style={{background:P.card,border:`1px solid ${P.bdr}`,borderRadius:8,padding:"8px 12px",fontSize:11}}>
    <div style={{color:P.dim,fontWeight:700,marginBottom:3}}>{label}</div>
    {payload.map((p,i)=>(<div key={i} style={{color:p.color,display:"flex",justifyContent:"space-between",gap:14}}>
      <span>{p.name}</span><span style={{fontWeight:700}}>{p.name==="DPU"||p.name==="DPS"?`${p.value}${cc}`:`${pc}${p.value}`}</span></div>))}
  </div>);
}

function ItemCard({r,isOpen,onToggle,onAllocChange,onRemove,assetType}){
  const hd=histData[r.tk];
  const last=hd?hd.data[hd.data.length-1]:null;
  const first=hd?hd.data[0]:null;
  const dpuC=hd&&first&&last?((Math.pow(last.d/first.d,1/(hd.data.length-1))-1)*100).toFixed(1):"—";
  const hasNta=hd&&last&&last.n!==null;
  const ntaC=hasNta?(((last.n-first.n)/first.n)*100).toFixed(0):"—";
  const pDisc=hasNta?(((last.p-last.n)/last.n)*100).toFixed(0):"—";
  const dLabel=assetType==="equity"?"DPS":"DPU";
  return(
    <div style={{marginBottom:8,background:P.card,border:`1px solid ${isOpen?P.bdrH:P.bdr}`,borderRadius:10,overflow:"hidden",position:"relative"}}>
      {r.src==="ai"&&<div style={{position:"absolute",top:0,right:0,fontSize:7,padding:"2px 8px",background:P.prpD+"66",color:P.prp,borderBottomLeftRadius:6,fontWeight:700,letterSpacing:1,zIndex:1}}>NEW</div>}
      <button onClick={onToggle} style={{width:"100%",padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",color:P.text,cursor:"pointer",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:15}}>{r.fl}</span>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
              <span style={{fontWeight:800,fontSize:11,color:P.acc,fontFamily:"monospace"}}>{r.tk.includes("MINT")?"TBD.SI":r.tk}</span>
              <span style={{fontSize:7,padding:"2px 5px",borderRadius:3,background:P.bdr,color:P.mutd}}>{r.tag}</span>
            </div>
            <div style={{fontSize:10,color:P.mutd,marginTop:1}}>{r.nm}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:800,fontSize:12}}>${(r.al/1000).toFixed(0)}K</div>
            <div style={{fontSize:9,color:P.grn,fontWeight:600}}>{r.m.yl}</div>
          </div>
          <svg width="10" height="10" viewBox="0 0 10 10" style={{transform:isOpen?"rotate(180deg)":"",transition:"0.2s"}}><path d="M1 3L5 7L9 3" stroke={P.dim} strokeWidth="1.5" fill="none"/></svg>
        </div>
      </button>
      {isOpen&&(
        <div style={{borderTop:`1px solid ${P.bdr}`,padding:"12px 14px"}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}>
            <a href={r.lk} target="_blank" rel="noopener noreferrer" style={{fontSize:8,padding:"3px 9px",borderRadius:5,background:P.accD+"55",color:P.acc,textDecoration:"none",fontWeight:600}}>📈 Finance →</a>
            <span style={{fontSize:8,padding:"3px 9px",borderRadius:5,background:r.int?P.grnD:P.bdr,color:r.int?P.grn:P.dim,fontWeight:600}}>{r.int?"🏠 Internal":`🏢 ${r.mgr}`}</span>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:8,color:P.dim}}>$</span>
              <input type="number" value={r.al} onChange={e=>onAllocChange(parseInt(e.target.value)||0)} style={{width:65,padding:"3px 5px",borderRadius:4,border:`1px solid ${P.bdr}`,background:P.bg,color:P.text,fontSize:9,textAlign:"right",fontFamily:"monospace"}}/>
              <button onClick={onRemove} style={{fontSize:8,padding:"3px 7px",borderRadius:4,border:`1px solid ${P.redD}`,background:P.redD+"33",color:P.red,cursor:"pointer",fontWeight:600}}>✕</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:12}}>
            {[{l:"Portfolio",v:r.m.pv},{l:assetType==="reit"?"Props":"Assets",v:r.m.pr},{l:"Occ.",v:r.m.oc,c:r.m.oc==="100%"?P.grn:null},{l:assetType==="reit"?"WALE":"Duration",v:r.m.wa},{l:"Gearing",v:r.m.ge,c:parseFloat(r.m.ge)<=30?P.grn:parseFloat(r.m.ge)>=40?P.red:null},{l:hasNta?"NTA":"Rating",v:hasNta?r.m.nt:r.m.rt},{l:"Yield",v:r.m.yl,c:P.grn},{l:"Hedged",v:r.m.hd},{l:assetType==="reit"?"Rating":"Struct.",v:assetType==="reit"?r.m.rt:(r.m.rt||"—")},{l:hasNta?"P/NTA":"DPU CAGR",v:hasNta?`${pDisc}%`:`${dpuC}%`,c:hasNta?(parseInt(pDisc)<0?P.grn:P.amb):(parseFloat(dpuC)>=0?P.grn:P.red)}].map((x,i)=>(
              <div key={i} style={{background:P.bg,borderRadius:5,padding:"5px 3px",textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:x.c||P.text}}>{x.v}</div>
                <div style={{fontSize:6,color:P.dim,letterSpacing:0.5,marginTop:1}}>{x.l}</div>
              </div>
            ))}
          </div>
          {hd&&(<div style={{background:P.bg,borderRadius:8,padding:"8px 4px 2px 0",marginBottom:8}}>
            <div style={{fontSize:8,fontWeight:700,color:P.dim,letterSpacing:1,marginLeft:8,marginBottom:4}}>PRICE {hasNta?"· NTA ":""} · {dLabel}</div>
            <ResponsiveContainer width="100%" height={130}>
              <ComposedChart data={hd.data.map(d=>({year:d.y,price:d.p,...(d.n!==null?{nta:d.n}:{}),[dLabel]:d.d}))} margin={{top:5,right:6,left:-8,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.bdr}/>
                <XAxis dataKey="year" tick={{fill:P.dim,fontSize:7}} axisLine={{stroke:P.bdr}}/>
                <YAxis yAxisId="p" tick={{fill:P.dim,fontSize:7}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="d" orientation="right" tick={{fill:P.dim,fontSize:7}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip pc={hd.pc} cc={hd.c}/>}/>
                {hasNta&&<Area yAxisId="p" type="monotone" dataKey="nta" fill={P.amb+"11"} stroke={P.amb} strokeWidth={1} strokeDasharray="4 3" name="NTA" dot={false}/>}
                <Line yAxisId="p" type="monotone" dataKey="price" stroke={P.acc} strokeWidth={2} name="Price" dot={{r:2,fill:P.acc}}/>
                <Bar yAxisId="d" dataKey={dLabel} name={dLabel} radius={[2,2,0,0]} barSize={14}>
                  {hd.data.map((d,i)=><Cell key={i} fill={i>0&&d.d<hd.data[i-1].d?P.red+"44":P.grn+"44"}/>)}
                </Bar>
                <Legend wrapperStyle={{fontSize:7,color:P.dim}}/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>)}
          {!hd&&<div style={{background:P.bg,borderRadius:8,padding:10,marginBottom:8,fontSize:9,color:P.dim,textAlign:"center"}}>📊 No historical data — new position or IPO pending</div>}
          {hd&&<div style={{display:"grid",gridTemplateColumns:hasNta?"1fr 1fr 1fr":"1fr 1fr",gap:5,marginBottom:8}}>
            {[{l:`${dLabel} CAGR`,v:`${dpuC}%`,c:parseFloat(dpuC)>=0?P.grn:P.red,bc:P.grn},...(hasNta?[{l:"NTA Growth",v:`+${ntaC}%`,c:P.grn,bc:P.amb},{l:"Price/NTA",v:`${pDisc}%`,c:parseInt(pDisc)<=0?P.grn:P.amb,bc:P.acc}]:[{l:"Div Streak",v:r.tk==="APA.AX"?"20yr":r.tk==="A7RU.SI"?"5yr+":"—",c:P.grn,bc:P.amb}])].map((x,i)=>(
              <div key={i} style={{background:P.bg,borderRadius:5,padding:"5px 7px",borderLeft:`3px solid ${x.bc}`}}>
                <div style={{fontSize:7,color:P.dim}}>{x.l}</div><div style={{fontSize:12,fontWeight:800,color:x.c}}>{x.v}</div>
              </div>))}
          </div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>
            {r.tn.map((t,i)=><span key={i} style={{fontSize:7,padding:"2px 6px",borderRadius:3,background:P.bdr,color:P.mutd}}>{t}</span>)}
          </div>
          <div style={{background:P.bg,borderRadius:8,padding:"10px 12px",marginBottom:8,borderLeft:`3px solid ${P.acc}`}}>
            <div style={{fontSize:8,fontWeight:800,color:P.acc,letterSpacing:1,marginBottom:6}}>📖 INVESTMENT THESIS</div>
            {r.writeup.split("\n\n").map((p,i)=><p key={i} style={{fontSize:10,color:P.mutd,lineHeight:1.7,margin:"0 0 8px 0"}}>{p}</p>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <div style={{background:P.redD+"33",borderRadius:6,padding:7,borderLeft:`3px solid ${P.red}`}}>
              <div style={{fontSize:7,fontWeight:700,color:P.red,letterSpacing:1,marginBottom:3}}>⚠ RISKS</div>
              <div style={{fontSize:8,color:P.mutd,lineHeight:1.5}}>{r.rk}</div>
            </div>
            <div style={{background:P.grnD+"33",borderRadius:6,padding:7,borderLeft:`3px solid ${P.grn}`}}>
              <div style={{fontSize:7,fontWeight:700,color:P.grn,letterSpacing:1,marginBottom:3}}>🚀 CATALYSTS</div>
              <div style={{fontSize:8,color:P.mutd,lineHeight:1.5}}>{r.ct}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AIAssistant({data}){
  const [msgs,setMsgs]=useState([]);const [input,setInput]=useState("");const [loading,setLoading]=useState(false);const scrollRef=useRef(null);
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[msgs,loading]);
  const all=data.flatMap(a=>a.theses.flatMap(t=>t.items));
  const sysP=`You are a portfolio analyst. The user has a ${all.length}-position defensive income portfolio ($${(all.reduce((s,r)=>s+r.al,0)/1000).toFixed(0)}K) across REITs, business trusts, and equities.\nPositions:\n${all.map(r=>`• ${r.tk} (${r.ccy}) — $${(r.al/1000)}K, ${r.m.yl}`).join("\n")}\nRules: No office/malls. AUD/SGD/CHF. Be opinionated. Under 300 words.`;
  const send=useCallback(async(text)=>{
    if(!text.trim()||loading)return;const uMsg={role:"user",content:text.trim()};const nMsgs=[...msgs,uMsg];
    setMsgs(nMsgs);setInput("");setLoading(true);
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:sysP,messages:nMsgs.map(m=>({role:m.role,content:m.content})),tools:[{type:"web_search_20250305",name:"web_search"}]})});
      const d=await res.json();const txt=(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n");
      setMsgs(p=>[...p,{role:"assistant",content:txt||"No response."}]);
    }catch(err){setMsgs(p=>[...p,{role:"assistant",content:`Error: ${err.message}`}]);}finally{setLoading(false);}
  },[msgs,loading,sysP]);
  const renderMsg=(text)=>text.split("\n").map((line,i)=>{
    let h=line.replace(/\*\*(.+?)\*\*/g,`<b style="color:${P.w}">$1</b>`);
    h=h.replace(/\b([A-Z0-9]{2,6})\.(AX|SI|SW)\b/g,`<a href="https://www.google.com/finance/quote/$1:$2" target="_blank" style="color:${P.acc};font-weight:700;text-decoration:none">$&</a>`);
    if(line.trim().startsWith("•")||line.trim().startsWith("-"))return <div key={i} style={{paddingLeft:6,marginBottom:2}} dangerouslySetInnerHTML={{__html:h}}/>;
    if(!line.trim())return <div key={i} style={{height:5}}/>;
    return <div key={i} style={{marginBottom:3}} dangerouslySetInnerHTML={{__html:h}}/>;
  });
  const suggs=["What's my total portfolio yield?","Compare REIT vs equity allocations","Rate sensitivity analysis","Suggest a position to trim"];
  return(
    <div style={{background:P.card,border:`1px solid ${P.bdr}`,borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column",height:460}}>
      <div style={{padding:"9px 12px",borderBottom:`1px solid ${P.bdr}`,background:P.bg,display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:P.grn,boxShadow:`0 0 6px ${P.grn}66`}}/>
        <span style={{fontSize:10,fontWeight:700,color:P.text}}>Research Assistant</span>
        <span style={{fontSize:7,color:P.dim,marginLeft:"auto"}}>Claude · Web Search</span>
      </div>
      <div ref={scrollRef} style={{flex:1,overflow:"auto",padding:10}}>
        {msgs.length===0&&<div>
          <div style={{fontSize:9,color:P.mutd,marginBottom:8,lineHeight:1.5}}>I know your full {all.length}-position, multi-asset portfolio. Ask me anything.</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{suggs.map((s,i)=>(
            <button key={i} onClick={()=>send(s)} style={{fontSize:8,padding:"4px 8px",borderRadius:5,border:`1px solid ${P.bdr}`,background:P.bg,color:P.mutd,cursor:"pointer"}}
              onMouseEnter={e=>{e.target.style.borderColor=P.acc;e.target.style.color=P.acc;}} onMouseLeave={e=>{e.target.style.borderColor=P.bdr;e.target.style.color=P.mutd;}}>{s}</button>
          ))}</div>
        </div>}
        {msgs.map((m,i)=>(<div key={i} style={{marginBottom:8,display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
          <div style={{maxWidth:"90%",padding:"7px 10px",borderRadius:9,fontSize:10,lineHeight:1.5,background:m.role==="user"?P.accD+"55":P.bg,color:m.role==="user"?P.acc:P.mutd,border:`1px solid ${m.role==="user"?P.accD:P.bdr}`}}>
            {m.role==="user"?m.content:renderMsg(m.content)}
          </div></div>))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"6px 0"}}>
          <style>{`@keyframes dp{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}`}</style>
          {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:P.acc,animation:`dp 1.2s ease ${i*.2}s infinite`}}/>)}
          <span style={{fontSize:8,color:P.dim}}>Researching...</span>
        </div>}
      </div>
      <div style={{padding:"8px 10px",borderTop:`1px solid ${P.bdr}`,background:P.bg,display:"flex",gap:5}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}}
          placeholder="Ask about your portfolio..." style={{flex:1,padding:"7px 10px",borderRadius:7,border:`1px solid ${P.bdr}`,background:P.card,color:P.text,fontSize:10,outline:"none"}}
          onFocus={e=>e.target.style.borderColor=P.acc} onBlur={e=>e.target.style.borderColor=P.bdr}/>
        <button onClick={()=>send(input)} disabled={loading||!input.trim()} style={{padding:"7px 12px",borderRadius:7,border:"none",background:loading||!input.trim()?P.bdr:P.acc,color:loading||!input.trim()?P.dim:P.bg,fontSize:10,fontWeight:700,cursor:loading?"wait":"pointer"}}>{loading?"⏳":"→"}</button>
      </div>
    </div>
  );
}

export default function ReitPortfolioDetailed(){
  const [portfolio,setPortfolio]=useState("lal");
  const initMap={lal:initData,gs:gsData,jb:jbData};
  const [lalD,setLalD]=useState(initData);
  const [gsD,setGsD]=useState(gsData);
  const [jbD,setJbD]=useState(jbData);
  const dataMap={lal:lalD,gs:gsD,jb:jbD};
  const setMap={lal:setLalD,gs:setGsD,jb:setJbD};
  const data=dataMap[portfolio];
  const setData=setMap[portfolio];
  const [openTk,setOpenTk]=useState(null);
  const [openThesis,setOpenThesis]=useState(null);
  const [openAsset,setOpenAsset]=useState(null);
  const [tab,setTab]=useState("portfolio");

  const all=data.flatMap(a=>a.theses.flatMap(t=>t.items));
  const total=all.reduce((s,r)=>s+r.al,0);
  const ccys=[...new Set(all.map(r=>r.ccy))];
  const byCcy=c=>all.filter(r=>r.ccy===c).reduce((s,r)=>s+r.al,0);
  const byType=id=>data.find(a=>a.assetType===id)?.theses.flatMap(t=>t.items).reduce((s,r)=>s+r.al,0)||0;

  const updateAlloc=(tk,val)=>setData(prev=>prev.map(a=>({...a,theses:a.theses.map(t=>({...t,items:t.items.map(r=>r.tk===tk?{...r,al:val}:r)}))})));
  const removeItem=(tk)=>setData(prev=>prev.map(a=>({...a,theses:a.theses.map(t=>({...t,items:t.items.filter(r=>r.tk!==tk)})).filter(t=>t.items.length>0)})));
  const pf=PORTFOLIOS.find(p=>p.id===portfolio);

  return(
    <div style={{background:P.bg,minHeight:"100vh",color:P.text,fontFamily:"'SF Mono','Fira Code',monospace",padding:"16px 12px"}}>
      <div style={{maxWidth:880,margin:"0 auto"}}>
        {/* Portfolio Selector */}
        <div style={{display:"flex",gap:0,marginBottom:12,background:P.card,borderRadius:10,padding:3,border:`1px solid ${P.bdr}`}}>
          {PORTFOLIOS.map(p=>(
            <button key={p.id} onClick={()=>{setPortfolio(p.id);setOpenTk(null);setOpenThesis(null);setOpenAsset(null);setTab("portfolio");}}
              style={{flex:1,padding:"10px 8px",borderRadius:8,border:"none",cursor:"pointer",
                background:portfolio===p.id?p.color+"22":"transparent",
                color:portfolio===p.id?p.color:P.dim,fontSize:11,fontWeight:800,transition:"0.2s"}}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <div style={{width:3,height:22,background:pf.color,borderRadius:2}}/>
          <h1 style={{fontSize:17,fontWeight:800,margin:0,fontFamily:"system-ui,sans-serif",letterSpacing:"-0.5px"}}>{pf.label}</h1>
          <span style={{fontSize:8,padding:"3px 8px",borderRadius:5,background:pf.color+"22",color:pf.color,fontWeight:600,marginLeft:4}}>{pf.desc}</span>
        </div>
        <p style={{color:P.dim,fontSize:9,margin:"0 0 14px 11px"}}>{all.length} positions · {data.reduce((s,a)=>s+a.theses.length,0)} theses · Conviction-ranked</p>

        {all.length>0&&total>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(3+ccys.length,7)},1fr)`,gap:5,marginBottom:14}}>
          {[{l:"TOTAL",v:`$${(total/1000).toFixed(0)}K`,c:pf.color},
            {l:"REITS",v:`$${(byType("reit")/1000).toFixed(0)}K`,c:P.acc},
            {l:"EQUITIES",v:`$${(byType("equity")/1000).toFixed(0)}K`,c:P.prp},
            ...ccys.map(c=>({l:c,v:`${((byCcy(c)/total)*100).toFixed(0)}%`,c:P.amb}))
          ].map((s,i)=>(
            <div key={i} style={{background:P.card,border:`1px solid ${P.bdr}`,borderRadius:7,padding:"7px 3px",textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:6,color:P.dim,letterSpacing:1,marginTop:1}}>{s.l}</div>
            </div>
          ))}
        </div>}

        <div style={{display:"flex",gap:0,marginBottom:14,background:P.card,borderRadius:8,padding:3,border:`1px solid ${P.bdr}`}}>
          {[{id:"portfolio",icon:"📋",label:"Holdings"},{id:"assistant",icon:"🤖",label:"AI Assistant"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 10px",borderRadius:6,border:"none",cursor:"pointer",background:tab===t.id?P.accD+"44":"transparent",color:tab===t.id?P.acc:P.dim,fontSize:11,fontWeight:700}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab==="portfolio"&&(<>
          {ASSET_TYPES.map(at=>{
            const atData=data.find(a=>a.assetType===at.id);
            if(!atData||atData.theses.length===0)return null;
            const atItems=atData.theses.flatMap(t=>t.items);
            const atTotal=atItems.reduce((s,r)=>s+r.al,0);
            const isOpenAt=openAsset===at.id;
            return(
              <div key={at.id} style={{marginBottom:16}}>
                <button onClick={()=>setOpenAsset(isOpenAt?null:at.id)} style={{width:"100%",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",background:`linear-gradient(135deg, ${at.color}08, ${at.color}03)`,border:`1px solid ${isOpenAt?at.color+"44":P.bdr}`,borderRadius:isOpenAt?"12px 12px 0 0":"12px",cursor:"pointer",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:24}}>{at.icon}</span>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:at.color,fontFamily:"system-ui,sans-serif"}}>{at.label}</div>
                      <div style={{fontSize:8,color:P.mutd,marginTop:2}}>{at.desc}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right",minWidth:70}}>
                    <div style={{fontSize:16,fontWeight:800,color:P.text}}>${(atTotal/1000).toFixed(0)}K</div>
                    <div style={{fontSize:9,color:P.dim}}>{atItems.length} positions · {total?((atTotal/total)*100).toFixed(0):0}%</div>
                  </div>
                </button>
                {isOpenAt&&(
                  <div style={{border:`1px solid ${at.color}22`,borderTop:"none",borderRadius:"0 0 12px 12px",background:P.card+"88",padding:"4px 0"}}>
                    {atData.theses.map(thesis=>{
                      const isOpenTh=openThesis===thesis.id;
                      const thTotal=thesis.items.reduce((s,r)=>s+r.al,0);
                      return(
                        <div key={thesis.id} style={{margin:"4px 8px"}}>
                          <button onClick={()=>setOpenThesis(isOpenTh?null:thesis.id)} style={{width:"100%",padding:"10px 12px",background:P.card,border:`1px solid ${isOpenTh?thesis.color+"44":P.bdr}`,borderRadius:isOpenTh?"8px 8px 0 0":"8px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:18}}>{thesis.icon}</span>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                                <span style={{fontSize:12,fontWeight:800,color:thesis.color,fontFamily:"system-ui,sans-serif"}}>{thesis.title}</span>
                                <span style={{fontSize:7,padding:"2px 6px",borderRadius:4,background:CONV_CLR[thesis.conviction]+"22",color:CONV_CLR[thesis.conviction],fontWeight:700}}>{CONVICTION[thesis.conviction]}</span>
                              </div>
                              <div style={{fontSize:8,color:P.mutd,marginTop:1}}>{thesis.sub} · {thesis.items.length} pos · ${(thTotal/1000).toFixed(0)}K</div>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:13,fontWeight:800}}>${(thTotal/1000).toFixed(0)}K</div>
                              <div style={{fontSize:8,color:P.dim}}>{total?((thTotal/total)*100).toFixed(0):0}%</div>
                            </div>
                          </button>
                          {isOpenTh&&(
                            <div style={{background:P.card,border:`1px solid ${thesis.color}22`,borderTop:"none",borderRadius:"0 0 8px 8px",padding:"0 10px 10px"}}>
                              <div style={{padding:"8px 0 10px",borderBottom:`1px solid ${P.bdr}`,marginBottom:8}}>
                                <p style={{fontSize:9,color:P.mutd,lineHeight:1.6,margin:0}}>{thesis.desc}</p>
                              </div>
                              {thesis.items.map(r=>(
                                <ItemCard key={r.tk} r={r} isOpen={openTk===r.tk} onToggle={()=>setOpenTk(openTk===r.tk?null:r.tk)}
                                  onAllocChange={v=>updateAlloc(r.tk,v)} onRemove={()=>removeItem(r.tk)} assetType={at.id}/>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>)}

        {tab==="assistant"&&<AIAssistant data={data}/>}

        <div style={{marginTop:16,padding:8,background:P.card,borderRadius:8,border:`1px solid ${P.bdr}`}}>
          <p style={{fontSize:7,color:P.dim,lineHeight:1.5,margin:0,fontStyle:"italic"}}>Discussion framework, not financial advice. Data from company filings & research (Feb 2026). AI may error — verify independently. Past performance ≠ future results.</p>
        </div>
      </div>
    </div>
  );
}
