import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Tag,
  Tooltip,
  Spin,
  Progress,
  message,
  Modal,
  Divider,
  Slider,
  InputNumber,
  Switch,
  Select,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  RightOutlined,
  LeftOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  PictureOutlined,
  CloseOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  DragOutlined,
  CheckOutlined,
  UndoOutlined,
  RedoOutlined,
  PlusCircleOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  SettingOutlined,
  UpOutlined,
  DownOutlined,
  ScissorOutlined,
  ExpandAltOutlined,
  ArrowsAltOutlined,
  CopyOutlined,
  UserOutlined,
  TagOutlined,
  ColumnWidthOutlined,
  BorderOutlined,
  PlusOutlined,
  SwapOutlined,
  HolderOutlined,
  LockOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  GiftOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import _ from "lodash";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { EnvHelper } from "../../helper/EnvHelper";
import {
  getPhotoBookDesign,
  savePhotoBookDesign,
  validatePhotoBookDesign,
  getPhotoBookTemplates,
  getPhotoBookTemplateById,
  addToShoppingCart,
} from "../../helper/api_helper";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";
import {
  formatBookSizeInches,
  resolveEditionPriceForSize,
  getEditionPricingDetailsForSize,
} from "../../helper/photobookSizeHelper";
import YourBookStep, { getPhotoBoundsForDensity } from "../../components/Product/PhotoBookSteps/YourBookStep";
import UploadPhotosStep from "../../components/Product/PhotoBookSteps/UploadPhotosStep";

const UPLOAD_BASE_URL = EnvHelper.UPLOAD_BASE_API_URL || EnvHelper.BASE_API_URL;
const BASE_URL = EnvHelper.BASE_API_URL;

const RESIZE_HANDLES = [
  { position: "nw", cursor: "nwse-resize", className: "-top-1.5 -left-1.5" },
  { position: "n", cursor: "ns-resize", className: "-top-1.5 left-1/2 -translate-x-1/2" },
  { position: "ne", cursor: "nesw-resize", className: "-top-1.5 -right-1.5" },
  { position: "e", cursor: "ew-resize", className: "top-1/2 -translate-y-1/2 -right-1.5" },
  { position: "se", cursor: "nwse-resize", className: "-bottom-1.5 -right-1.5" },
  { position: "s", cursor: "ns-resize", className: "-bottom-1.5 left-1/2 -translate-x-1/2" },
  { position: "sw", cursor: "nesw-resize", className: "-bottom-1.5 -left-1.5" },
  { position: "w", cursor: "ew-resize", className: "top-1/2 -translate-y-1/2 -left-1.5" },
];

export const MODAL_RESIZE_HANDLES = [
  { position: "nw", cursor: "nwse-resize", xPct: 0, yPct: 0 },
  { position: "n", cursor: "ns-resize", xPct: 0.5, yPct: 0 },
  { position: "ne", cursor: "nesw-resize", xPct: 1, yPct: 0 },
  { position: "e", cursor: "ew-resize", xPct: 1, yPct: 0.5 },
  { position: "se", cursor: "nwse-resize", xPct: 1, yPct: 1 },
  { position: "s", cursor: "ns-resize", xPct: 0.5, yPct: 1 },
  { position: "sw", cursor: "nesw-resize", xPct: 0, yPct: 1 },
  { position: "w", cursor: "ew-resize", xPct: 0, yPct: 0.5 },
];

export const PRESET_DECORATIONS = [
  {
    id: "dec_wreath",
    name: "Floral Laurel Wreath",
    category: "Wedding & Floral",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M50 85 C30 85 15 65 15 45 C15 25 35 15 45 15 M50 85 C70 85 85 65 85 45 C85 25 65 15 55 15"/><circle cx="20" cy="50" r="3" fill="currentColor"/><circle cx="80" cy="50" r="3" fill="currentColor"/><circle cx="30" cy="70" r="3" fill="currentColor"/><circle cx="70" cy="70" r="3" fill="currentColor"/><circle cx="30" cy="30" r="3" fill="currentColor"/><circle cx="70" cy="30" r="3" fill="currentColor"/></svg>`,
  },
  {
    id: "dec_botanical_branch",
    name: "Olive Botanical Branch",
    category: "Wedding & Floral",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 90 Q40 50 90 20"/><path d="M30 70 Q25 55 35 50 Q45 60 30 70" fill="currentColor" fill-opacity="0.3"/><path d="M50 50 Q45 35 55 30 Q65 40 50 50" fill="currentColor" fill-opacity="0.3"/><path d="M70 33 Q65 18 75 15 Q85 25 70 33" fill="currentColor" fill-opacity="0.3"/><path d="M35 75 Q50 80 50 70 Q40 65 35 75" fill="currentColor" fill-opacity="0.3"/><path d="M55 55 Q70 60 70 50 Q60 45 55 55" fill="currentColor" fill-opacity="0.3"/></svg>`,
  },
  {
    id: "dec_double_hearts",
    name: "Intertwined Hearts",
    category: "Love & Romance",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M35 60 C15 45 10 32 10 23 C10 12 18 5 28 5 C35 5 41 9 44 15 C47 9 53 5 60 5 C70 5 78 12 78 23 C78 32 73 45 53 60 L44 68 Z" fill-opacity="0.75"/><path d="M55 75 C38 62 33 51 33 43 C33 34 40 28 48 28 C54 28 59 31 62 36 C65 31 70 28 76 28 C84 28 91 34 91 43 C91 51 86 62 70 75 L62 82 Z" stroke="#ffffff" stroke-width="2"/></svg>`,
  },
  {
    id: "dec_vintage_ribbon",
    name: "Banner Ribbon",
    category: "Badges & Banners",
    svg: `<svg viewBox="0 0 120 40" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 30 L25 10 L95 10 L110 30 L95 25 L25 25 Z" fill="currentColor" fill-opacity="0.15"/><path d="M15 10 L25 25 L10 30 Z" fill="currentColor"/><path d="M105 10 L95 25 L110 30 Z" fill="currentColor"/></svg>`,
  },
  {
    id: "dec_sparkle_stars",
    name: "Golden Sparkles",
    category: "Celebration",
    svg: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 10 Q50 40 20 50 Q50 60 50 90 Q50 60 80 50 Q50 40 50 10 Z"/><path d="M80 15 Q80 25 70 30 Q80 35 80 45 Q80 35 90 30 Q80 25 80 15 Z" fill-opacity="0.7"/><path d="M25 65 Q25 72 18 75 Q25 78 25 85 Q25 78 32 75 Q25 72 25 65 Z" fill-opacity="0.7"/></svg>`,
  },
  {
    id: "dec_ornate_corner",
    name: "Vintage Ornate Corner",
    category: "Borders & Frames",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 90 L10 20 Q10 10 20 10 L90 10"/><path d="M18 80 L18 24 Q18 18 24 18 L80 18"/><circle cx="28" cy="28" r="4" fill="currentColor"/><path d="M35 18 C35 25 25 35 18 35"/></svg>`,
  },
  {
    id: "dec_camera_retro",
    name: "Retro Memory Camera",
    category: "Icons",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><rect x="15" y="30" width="70" height="50" rx="8" fill="currentColor" fill-opacity="0.15"/><circle cx="50" cy="55" r="16"/><circle cx="50" cy="55" r="8" fill="currentColor"/><path d="M35 30 L42 20 L58 20 L65 30"/><circle cx="72" cy="40" r="3" fill="currentColor"/></svg>`,
  },
  {
    id: "dec_wax_seal",
    name: "Royal Wax Seal",
    category: "Badges & Banners",
    svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><circle cx="50" cy="50" r="40" stroke-dasharray="4 2"/><circle cx="50" cy="50" r="34" fill="currentColor" fill-opacity="0.15"/><path d="M42 45 Q50 35 58 45 Q50 65 42 45" fill="currentColor"/><circle cx="50" cy="50" r="24" stroke="currentColor"/></svg>`,
  },
];

export const resolveDecorationSvg = (el) => {
  if (el?.svg && typeof el.svg === "string" && el.svg.trim().startsWith("<svg")) {
    return el.svg;
  }
  if (el?.preset_id) {
    const presetMatch = PRESET_DECORATIONS.find((d) => d.id === el.preset_id);
    if (presetMatch) return presetMatch.svg;
  }
  const match = PRESET_DECORATIONS.find(
    (d) =>
      d.id === el?.id ||
      (el?.name && d.name?.toLowerCase() === el?.name?.toLowerCase()) ||
      d.id === el?.frame_id
  );
  if (match) return match.svg;
  return "";
};

// ── Default Sample Template Fallback (Vintage Wedding Book) ──────────────────
const DEFAULT_VINTAGE_TEMPLATE = {
  _id: "6ad05ad50ec48c46f0bb4ff7",
  template_name: "Vintage Wedding Book",
  template_id: "vintage-wedding-book",
  description: "Description for the vintage wedding book",
  category: "Wedding",
  thumbnail_url: "",
  supported_sizes: ["8x8", "10x10"],
  page_config: {
    min_pages: 10,
    max_pages: 50,
    default_pages: 26,
    aspect_ratio: "1:1",
  },
  status: "published",
  version: 1,
  published_version: 1,
  published_snapshot: {
    template_id: "vintage-wedding-book",
    template_name: "Vintage Wedding Book",
    version: 1,
    published_at: "2026-10-15T05:46:42.085Z",
    category: "Wedding",
    supported_sizes: ["8x8", "10x10"],
    page_config: {
      min_pages: 10,
      max_pages: 50,
      default_pages: 26,
      aspect_ratio: "1:1",
    },
    pages: [
      {
        page_id: "60d1ceb9-f204-4274-a66d-224fee92241b",
        name: "Front Cover",
        page_type: "front_cover",
        targeting_rule: {
          rule_type: "exact_page",
          page_number: 1,
        },
        background: {
          type: "color",
          value: "#fbe8eb",
          opacity: 1,
        },
        elements: [
          {
            border: { width: 0, color: "#ffffff", radius: 0 },
            shadow: { blur: 16, color: "rgba(0,0,0,0.25)", offsetX: 0, offsetY: 8 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "7152674f-e6c2-41e1-82b8-76df4889f6ae",
            type: "photo_frame",
            x: -1,
            y: -1,
            width: 1002,
            height: 1002,
            rotation: 0,
            z_index: 1,
            is_locked: false,
            is_hidden: false,
            frame_id: "cover_frame_1",
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "ef8f8ee7-8d92-491a-b9d4-b4a721279340",
            type: "text",
            x: -90,
            y: 46,
            width: 800,
            height: 70,
            rotation: 0,
            z_index: 14,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "OUR BEAUTIFUL MEMORIES",
            font_family: "Playfair Display",
            font_size: 42,
            font_weight: "bold",
            font_style: "normal",
            color: "#ffffff",
            align: "center",
            is_customer_editable: true,
            placeholder: "Book Title",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "0b99375e-a6ef-4aa3-ad03-edd5267f8184",
            type: "text",
            x: -268,
            y: 106,
            width: 800,
            height: 40,
            rotation: 0,
            z_index: 14,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "A Story of Love & Joy",
            font_family: "Caveat",
            font_size: 22,
            font_weight: "normal",
            font_style: "italic",
            color: "#ffffff",
            align: "center",
            is_customer_editable: true,
            placeholder: "Subtitle",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "9e4805ec-245d-4d62-8c1f-cd0433e179f8",
            type: "decoration",
            preset_id: "dec_ornate_corner",
            name: "Vintage Ornate Corner",
            x: -38,
            y: -38,
            width: 300,
            height: 300,
            rotation: 91,
            z_index: 3,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "#334155",
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "8baeca39-7a36-4dd7-9b3c-41f40599d11d",
            type: "decoration",
            preset_id: "dec_ornate_corner",
            name: "Vintage Ornate Corner",
            x: 460,
            y: 12,
            width: 300,
            height: 300,
            rotation: 0,
            z_index: 1,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "#334155",
          },
          {
            border: { width: 0, color: "#ffffff", radius: 0 },
            shadow: { blur: 10, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 4 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "7c842cc5-8139-4a2e-abfa-8e1c09d5a80f",
            type: "photo_frame",
            x: 54,
            y: 162,
            width: 400,
            height: 400,
            rotation: 0,
            z_index: 2,
            is_locked: false,
            is_hidden: false,
            frame_id: "frame_2_0029",
            shape: "circle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://onehorizonproductions.com/wp-content/uploads/2022/02/groom-carrying-the-bride-in-his-arms.jpg",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
        ],
      },
      {
        page_id: "48a1cab3-4b64-422c-97f9-ed2acdf5e527",
        name: "Interior - All Pages Default",
        page_type: "interior",
        targeting_rule: {
          rule_type: "all_interior",
          page_number: 2,
        },
        background: {
          type: "gradient",
          value: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
          opacity: 1,
        },
        elements: [
          {
            border: { width: 0, color: "#ffffff", radius: 4 },
            shadow: { blur: 8, color: "rgba(0,0,0,0.1)", offsetX: 0, offsetY: 4 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "5e032d24-97bf-4f02-a0fa-cd45be72caab",
            type: "photo_frame",
            x: 50,
            y: 60,
            width: 500,
            height: 880,
            rotation: 0,
            z_index: 1,
            is_locked: false,
            is_hidden: false,
            frame_id: "frame_19c89c",
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#ffffff", radius: 4 },
            shadow: { blur: 8, color: "rgba(0,0,0,0.1)", offsetX: 0, offsetY: 4 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "52639e45-38ce-47b9-8b37-b8ac536241cc",
            type: "photo_frame",
            x: 580,
            y: 60,
            width: 370,
            height: 420,
            rotation: 0,
            z_index: 1,
            is_locked: false,
            is_hidden: false,
            frame_id: "frame_0090c3",
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop&q=80",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#ffffff", radius: 4 },
            shadow: { blur: 8, color: "rgba(0,0,0,0.1)", offsetX: 0, offsetY: 4 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "0ee879a4-06a6-42f8-b423-79f78310e9b7",
            type: "photo_frame",
            x: 580,
            y: 520,
            width: 370,
            height: 420,
            rotation: 0,
            z_index: 1,
            is_locked: false,
            is_hidden: false,
            frame_id: "frame_f2371a",
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "bc124975-fd32-4647-8501-ff0f28bd4cb4",
            type: "decoration",
            preset_id: "dec_ornate_corner",
            name: "Vintage Ornate Corner",
            x: -14,
            y: -6,
            width: 300,
            height: 300,
            rotation: 0,
            z_index: 1,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "#ffffff",
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "b29ae67e-578b-477f-b1bf-84f113b429fe",
            type: "decoration",
            preset_id: "dec_ornate_corner",
            name: "Vintage Ornate Corner",
            x: 704,
            y: 706,
            width: 300,
            height: 300,
            rotation: 180,
            z_index: 2,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "#ffffff",
          },
        ],
      },
      {
        page_id: "1a26ba45-fe79-4987-a572-412cbe8f6265",
        name: "Interior - 2 Photo Collage",
        page_type: "interior",
        targeting_rule: {
          rule_type: "odd_interior",
          page_number: 3,
        },
        background: {
          type: "color",
          value: "#ffffff",
          opacity: 1,
        },
        elements: [
          {
            border: { width: 0, color: "#ffffff", radius: 4 },
            shadow: { blur: 10, color: "rgba(0,0,0,0.1)", offsetX: 0, offsetY: 4 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "a2b7e55e-8425-4566-b2fb-d900a8429ec1",
            type: "photo_frame",
            x: 60,
            y: 100,
            width: 410,
            height: 600,
            rotation: 0,
            z_index: 1,
            is_locked: false,
            is_hidden: false,
            frame_id: "interior_frame_left",
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&auto=format&fit=crop&q=80",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#ffffff", radius: 4 },
            shadow: { blur: 10, color: "rgba(0,0,0,0.1)", offsetX: 0, offsetY: 4 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "4b6321fc-ca86-4a8d-96ba-1af1d9f01eda",
            type: "photo_frame",
            x: 530,
            y: 100,
            width: 410,
            height: 600,
            rotation: 0,
            z_index: 2,
            is_locked: false,
            is_hidden: false,
            frame_id: "interior_frame_right",
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
            content: "",
            font_family: "Inter",
            font_size: 24,
            font_weight: "normal",
            font_style: "normal",
            color: "#1f2937",
            align: "center",
            is_customer_editable: true,
            placeholder: "",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "184e7dac-f690-44cf-a769-6e29fad664d7",
            type: "text",
            x: 100,
            y: 780,
            width: 800,
            height: 50,
            rotation: 0,
            z_index: 3,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "Cherished Memories Together",
            font_family: "Playfair Display",
            font_size: 24,
            font_weight: "bold",
            font_style: "normal",
            color: "#334155",
            align: "center",
            is_customer_editable: true,
            placeholder: "Story caption...",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
        ],
      },
      {
        page_id: "4acb0925-f247-4b4e-8aa9-07f0006d32c6",
        name: "Back Cover",
        page_type: "back_cover",
        targeting_rule: {
          rule_type: "exact_page",
          page_number: 20,
        },
        background: {
          type: "color",
          value: "#fbe8eb",
          opacity: 1,
        },
        elements: [
          {
            border: { width: 0, color: "#ffffff", radius: 4 },
            shadow: { blur: 10, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 4 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "back-frame-1",
            type: "photo_frame",
            x: 60,
            y: 80,
            width: 420,
            height: 840,
            rotation: 0,
            z_index: 2,
            frame_id: "back_frame_1",
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80",
            content: "",
            is_customer_editable: true,
          },
          {
            border: { width: 0, color: "#ffffff", radius: 4 },
            shadow: { blur: 10, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 4 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "back-frame-2",
            type: "photo_frame",
            x: 520,
            y: 80,
            width: 420,
            height: 840,
            rotation: 0,
            z_index: 2,
            frame_id: "back_frame_2",
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url:
              "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
            content: "",
            is_customer_editable: true,
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "5d0faa94-4e4a-4f84-a804-15651da4beb4",
            type: "text",
            x: 100,
            y: 650,
            width: 800,
            height: 60,
            rotation: 0,
            z_index: 2,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "Until Next Time",
            font_family: "Playfair Display",
            font_size: 32,
            font_weight: "bold",
            font_style: "italic",
            color: "#ffffff",
            align: "center",
            is_customer_editable: true,
            placeholder: "Closing Words",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
          {
            border: { width: 0, color: "#000000", radius: 0 },
            shadow: { blur: 0, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 0 },
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
            id: "834efc5b-49f3-4c14-8cdd-a4cf0b8fb3bf",
            type: "text",
            x: 100,
            y: 880,
            width: 800,
            height: 30,
            rotation: 0,
            z_index: 3,
            is_locked: false,
            is_hidden: false,
            shape: "rectangle",
            fit_mode: "cover",
            is_required: true,
            custom_svg_path: "",
            test_image_url: "",
            content: "Crafted with love • Printe Books",
            font_family: "Inter",
            font_size: 16,
            font_weight: "normal",
            font_style: "normal",
            color: "#94a3b8",
            align: "center",
            is_customer_editable: false,
            placeholder: "Publisher",
            asset_url: "",
            asset_type: "svg",
            opacity: 1,
            tint: "",
          },
        ],
      },
    ],
  },
};
DEFAULT_VINTAGE_TEMPLATE.pages = DEFAULT_VINTAGE_TEMPLATE.published_snapshot.pages;

export const getFontFamilyFallback = (fontName) => {
  const sansFonts = ["Inter", "Jost", "Roboto", "Montserrat", "Arial"];
  const scriptFonts = ["Caveat", "Dancing Script", "Great Vibes"];
  if (scriptFonts.includes(fontName)) return `'${fontName}', cursive`;
  if (sansFonts.includes(fontName)) return `'${fontName}', sans-serif`;
  return `'${fontName}', serif`;
};

// ── Photoshop-Style Interactive Crop & Pan Modal (Customer Side) ─────────────
const CropPhotoModal = ({ frame, onClose, onApply }) => {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [fitMode, setFitMode] = useState("cover");
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    if (frame) {
      setZoom(frame?.crop?.zoom || 1);
      setOffsetX(frame?.crop?.offsetX || 0);
      setOffsetY(frame?.crop?.offsetY || 0);
      setRotation(frame?.rotation || 0);
      setFitMode(frame?.fit_mode || "cover");
    }
  }, [frame]);

  if (!frame) return null;

  const photoUrl = frame.photo_url || frame.test_image_url || frame.sample_image_url || frame.image_url || "";
  const frameWidth = frame.width || 400;
  const frameHeight = frame.height || 300;
  const shape = frame.shape || "rectangle";
  const is1to1Shape = ["circle", "heart", "star", "scallop", "hexagon"].includes(shape);
  const radiusVal = frame.border?.radius ?? frame.corner_radius ?? (shape === "circle" ? 50 : 0);
  const clipDef = getShapeClipPathDefinition(shape, radiusVal);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: offsetX,
      startY: offsetY,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextX = Math.round(Math.max(-80, Math.min(80, dragStartRef.current.startX + dx * 0.25)));
    const nextY = Math.round(Math.max(-80, Math.min(80, dragStartRef.current.startY + dy * 0.25)));
    setOffsetX(nextX);
    setOffsetY(nextY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setFitMode("cover");
  };

  const handleSave = () => {
    onApply({
      crop: { zoom, offsetX, offsetY },
      rotation,
      fit_mode: fitMode,
    });
  };

  return (
    <Modal
      open={Boolean(frame)}
      onCancel={onClose}
      footer={null}
      centered
      width={720}
      title={
        <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
          <ScissorOutlined className="text-teal-600 text-base" />
          <span>Crop & Pan Photo inside Placeholder ({shape})</span>
        </div>
      }
    >
      <div
        className="flex flex-col gap-4 py-2"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <span className="flex items-center gap-1.5 font-medium">
            <DragOutlined className="text-teal-600" />
            Drag inside the photo to pan. Use sliders below to zoom, pan, and rotate.
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
          >
            <UndoOutlined /> Reset
          </button>
        </div>

        {/* Canvas / Frame Preview Area */}
        <div className="relative w-full h-[360px] bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner select-none">
          {/* Subtle Photoshop checkerboard background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          />

          <div
            style={{
              aspectRatio: is1to1Shape ? "1 / 1" : `${frameWidth} / ${frameHeight}`,
              maxHeight: "320px",
              maxWidth: "90%",
              width: is1to1Shape ? "320px" : undefined,
            }}
            className="relative h-full overflow-hidden border-2 border-teal-500/80 shadow-2xl bg-black cursor-grab active:cursor-grabbing flex items-center justify-center"
            onMouseDown={handleMouseDown}
          >
            {photoUrl ? (
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="overflow-visible w-full h-full pointer-events-none"
              >
                <defs>
                  <clipPath id="crop-modal-clip-mask" clipPathUnits="objectBoundingBox">
                    {renderShapeSvgClip(clipDef)}
                  </clipPath>
                </defs>
                <image
                  href={photoUrl}
                  x={`${offsetX}%`}
                  y={`${offsetY}%`}
                  width="100"
                  height="100"
                  preserveAspectRatio={
                    fitMode === "contain"
                      ? "xMidYMid meet"
                      : fitMode === "stretch" || fitMode === "fill"
                      ? "none"
                      : "xMidYMid slice"
                  }
                  style={{
                    transformOrigin: "50% 50%",
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                  }}
                  clipPath="url(#crop-modal-clip-mask)"
                />
                {/* Border overlay following the exact clip shape */}
                <g
                  transform="scale(100, 100)"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth={1.5 / Math.min(frameWidth || 400, frameHeight || 400)}
                  vectorEffect="non-scaling-stroke"
                >
                  {renderShapeSvgClip(clipDef)}
                </g>
              </svg>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                No customer photo loaded
              </div>
            )}

            {/* 3x3 Rule of Thirds Crop Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-teal-400/40 opacity-70">
              <div className="border-r border-b border-teal-400/30" />
              <div className="border-r border-b border-teal-400/30" />
              <div className="border-b border-teal-400/30" />
              <div className="border-r border-b border-teal-400/30" />
              <div className="border-r border-b border-teal-400/30" />
              <div className="border-b border-teal-400/30" />
              <div className="border-r border-teal-400/30" />
              <div className="border-r border-teal-400/30" />
              <div />
            </div>

            {/* Corner marks */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white pointer-events-none" />
          </div>
        </div>

        {/* Photoshop Controls Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {/* Zoom Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <ZoomInOutlined className="text-teal-600" />
                Zoom Scale
              </span>
              <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-bold">
                {(zoom * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
                className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer"
              >
                -
              </button>
              <Slider
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(z) => setZoom(z)}
                className="flex-1 my-0"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
                className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Pan / Offset Sliders */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <DragOutlined className="text-teal-600" />
                Pan Position (X / Y)
              </span>
              <span className="font-mono text-slate-600 text-[11px]">
                X: {offsetX}% | Y: {offsetY}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">X</span>
                <Slider
                  min={-60}
                  max={60}
                  step={1}
                  value={offsetX}
                  onChange={(v) => setOffsetX(v)}
                  className="flex-1 my-0"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">Y</span>
                <Slider
                  min={-60}
                  max={60}
                  step={1}
                  value={offsetY}
                  onChange={(v) => setOffsetY(v)}
                  className="flex-1 my-0"
                />
              </div>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
              <RotateRightOutlined className="text-teal-600" />
              Rotation: <span className="font-mono text-teal-700">{rotation}°</span>
            </span>
            <div className="flex items-center gap-1">
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => setRotation(deg)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                    rotation === deg
                      ? "bg-teal-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {deg}°
                </button>
              ))}
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Rotate 90° Clockwise"
              >
                <RotateRightOutlined /> +90°
              </button>
            </div>
          </div>

          {/* Fit Mode Switcher */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-700 font-semibold">Fitting Mode</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setFitMode("cover")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  fitMode === "cover"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Cover (Fill)
              </button>
              <button
                type="button"
                onClick={() => setFitMode("contain")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  fitMode === "contain"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Contain (Fit)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#00a896] hover:bg-[#008f80] text-white font-bold text-xs px-6 py-2 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <CheckOutlined /> Apply Crop & Transform
          </button>
        </div>
      </div>
    </Modal>
  );
};

const BG_POSITION_PRESETS = [
  { label: "Top-Left", x: 0, y: 0, icon: "↖" },
  { label: "Top", x: 50, y: 0, icon: "⬆" },
  { label: "Top-Right", x: 100, y: 0, icon: "↗" },
  { label: "Left", x: 0, y: 50, icon: "⬅" },
  { label: "Center", x: 50, y: 50, icon: "⏺" },
  { label: "Right", x: 100, y: 50, icon: "➡" },
  { label: "Bottom-Left", x: 0, y: 100, icon: "↙" },
  { label: "Bottom", x: 50, y: 100, icon: "⬇" },
  { label: "Bottom-Right", x: 100, y: 100, icon: "↘" },
];

const BackgroundRepositionModal = ({
  open,
  onClose,
  bg,
  onSave,
  aspectRatio = "1:1",
}) => {
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [scale, setScale] = useState(1);
  const [fitMode, setFitMode] = useState("cover");
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialPosX: 50, initialPosY: 50 });
  const previewBoxRef = useRef(null);

  useEffect(() => {
    if (open && bg) {
      setPosX(bg.position_x !== undefined ? bg.position_x : 50);
      setPosY(bg.position_y !== undefined ? bg.position_y : 50);
      setScale(bg.scale !== undefined ? bg.scale : 1);
      setFitMode(bg.fit_mode || "cover");
    }
  }, [open, bg]);

  if (!bg || !bg.value) return null;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: posX,
      initialPosY: posY,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const box = previewBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    const deltaPctX = (deltaX / rect.width) * 100;
    const deltaPctY = (deltaY / rect.height) * 100;

    const nextX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.initialPosX - deltaPctX)));
    const nextY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.initialPosY - deltaPctY)));

    setPosX(nextX);
    setPosY(nextY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApply = () => {
    onSave({
      ...bg,
      position_x: posX,
      position_y: posY,
      scale,
      fit_mode: fitMode,
    });
    onClose();
  };

  const handleReset = () => {
    setPosX(50);
    setPosY(50);
    setScale(1);
    setFitMode("cover");
  };

  const cssAspectRatio = aspectRatio ? String(aspectRatio).replace(":", " / ") : "1 / 1";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={680}
      title={
        <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
          <span className="text-teal-600 text-base">🎯</span>
          <span>Select Background Visible Area & Pan</span>
        </div>
      }
    >
      <div
        className="flex flex-col gap-4 py-2 select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <span className="flex items-center gap-1.5 font-medium">
            <DragOutlined className="text-teal-600 text-sm" />
            Click & drag the image preview to select the exact visible part on the page.
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
          >
            <UndoOutlined className="text-sm" /> Reset
          </button>
        </div>

        {/* Interactive Page Viewport Canvas */}
        <div className="relative w-full h-[320px] bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          />

          <div
            ref={previewBoxRef}
            onMouseDown={handleMouseDown}
            style={{
              aspectRatio: cssAspectRatio,
              maxHeight: "290px",
              maxWidth: "92%",
              backgroundImage: `url("${bg.value}")`,
              backgroundPosition: `${posX}% ${posY}%`,
              backgroundSize: scale > 1 ? `${Math.round(scale * 100)}%` : fitMode,
              backgroundRepeat: "no-repeat",
            }}
            className={`relative h-full overflow-hidden border-2 border-teal-400 shadow-2xl bg-white ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {/* Rule of Thirds Finder Grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Focal Point Indicator */}
            <div
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute w-6 h-6 border-2 border-teal-300 rounded-full bg-teal-500/30 flex items-center justify-center pointer-events-none shadow-md"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow" />
            </div>

            <div className="absolute bottom-2 left-2 bg-slate-900/80 text-teal-300 font-mono text-[10px] px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
              X: {posX}% • Y: {posY}% {scale > 1 ? `• Zoom: ${Math.round(scale * 100)}%` : ""}
            </div>
          </div>
        </div>

        {/* Reposition Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Quick Position Alignment
            </label>
            <div className="grid grid-cols-3 gap-1.5 max-w-[200px]">
              {BG_POSITION_PRESETS.map((p) => {
                const isActive = posX === p.x && posY === p.y;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPosX(p.x);
                      setPosY(p.y);
                    }}
                    className={`py-1.5 px-2 rounded border text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50"
                    }`}
                    title={p.label}
                  >
                    <span className="text-sm leading-none">{p.icon}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Select 9-point anchor or drag directly on the preview image.
            </div>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-medium text-slate-600">Horizontal Focus (X)</span>
                <span className="font-mono text-slate-500">{posX}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-medium text-slate-600">Vertical Focus (Y)</span>
                <span className="font-mono text-slate-500">{posY}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-medium text-slate-600">Zoom / Scale</span>
                <span className="font-mono text-slate-500">{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div>
              <span className="font-medium text-slate-600 block mb-1">
                Display Fit Mode
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: "cover", label: "Cover (Fill)" },
                  { id: "contain", label: "Contain (Fit)" },
                  { id: "100% 100%", label: "Stretch" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFitMode(mode.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      fitMode === mode.id
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-[#00a896] hover:bg-[#008f80] text-white font-bold text-xs px-6 py-2 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <CheckOutlined /> Apply Background Position
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Realistic 3D Interactive Photobook Flip Preview Component ────────────────
export const RealisticBookPreview = ({
  steps,
  currentStepIndex,
  onStepChange,
  renderCanvas,
  onClose,
  sizeInfo,
  availableSizes = [],
  onSelectSize = null,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState("next"); // "next" | "prev"
  const [transitionData, setTransitionData] = useState(null);

  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  const totalSteps = steps.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLast || isFlipping) return;
    const nextIdx = currentStepIndex + 1;
    const curr = steps[currentStepIndex];
    const nxt = steps[nextIdx];

    let leafFront = null;
    let leafBack = null;
    let stationaryLeft = null;
    let stationaryRight = null;

    if (curr.type === "cover_front") {
      leafFront = curr.page;
      leafBack = nxt.leftPage;
      stationaryLeft = nxt.leftPage;
      stationaryRight = nxt.rightPage;
    } else if (nxt.type === "cover_back") {
      leafFront = curr.rightPage;
      leafBack = nxt.page;
      stationaryLeft = curr.leftPage;
      stationaryRight = { is_blank: true, label: "" };
    } else {
      leafFront = curr.rightPage;
      leafBack = nxt.leftPage;
      stationaryLeft = curr.leftPage;
      stationaryRight = nxt.rightPage;
    }

    setTransitionData({
      leafFront,
      leafBack,
      stationaryLeft,
      stationaryRight,
    });
    setFlipDirection("next");
    setIsFlipping(true);

    setTimeout(() => {
      onStepChange(nextIdx);
      setIsFlipping(false);
      setTransitionData(null);
    }, 650);
  };

  const handlePrev = () => {
    if (isFirst || isFlipping) return;
    const prevIdx = currentStepIndex - 1;
    const curr = steps[currentStepIndex];
    const prv = steps[prevIdx];

    let leafFront = null;
    let leafBack = null;
    let stationaryLeft = null;
    let stationaryRight = null;

    if (curr.type === "cover_back") {
      leafFront = curr.page;
      leafBack = prv.rightPage;
      stationaryLeft = prv.leftPage;
      stationaryRight = prv.rightPage;
    } else if (prv.type === "cover_front") {
      leafFront = curr.leftPage;
      leafBack = prv.page;
      stationaryLeft = { is_blank: true, label: "" };
      stationaryRight = curr.rightPage;
    } else {
      leafFront = curr.leftPage;
      leafBack = prv.rightPage;
      stationaryLeft = prv.leftPage;
      stationaryRight = curr.rightPage;
    }

    setTransitionData({
      leafFront,
      leafBack,
      stationaryLeft,
      stationaryRight,
    });
    setFlipDirection("prev");
    setIsFlipping(true);

    setTimeout(() => {
      onStepChange(prevIdx);
      setIsFlipping(false);
      setTransitionData(null);
    }, 650);
  };

  const renderPageFace = (pageData, isLeft = false) => {
    if (!pageData || pageData.is_blank) {
      return (
        <div className="w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center text-slate-300 select-none relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000000 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <span className="text-xs uppercase tracking-widest font-serif opacity-40">
            {pageData?.label || (isLeft ? "Inside Front Cover" : "Inside Back Cover")}
          </span>
        </div>
      );
    }
    const pageObj = pageData.page || pageData;
    return renderCanvas(pageObj, false);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-4xl mx-auto py-1">
      {/* Dynamic 3D Book Keyframe Styles */}
      <style>{`
        @keyframes bookFlipNext3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
        @keyframes bookFlipPrev3D {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
        @keyframes shadowSweepNextFront {
          0% { opacity: 0; }
          45% { opacity: 0.6; }
          100% { opacity: 0.8; }
        }
        @keyframes shadowSweepNextBack {
          0% { opacity: 0.8; }
          55% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes shadowSweepPrevFront {
          0% { opacity: 0; }
          45% { opacity: 0.6; }
          100% { opacity: 0.8; }
        }
        @keyframes shadowSweepPrevBack {
          0% { opacity: 0.8; }
          55% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        .book-leaf-turning-next {
          animation: bookFlipNext3D 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .book-leaf-turning-prev {
          animation: bookFlipPrev3D 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .book-shadow-next-front {
          animation: shadowSweepNextFront 0.65s ease-in-out forwards;
        }
        .book-shadow-next-back {
          animation: shadowSweepNextBack 0.65s ease-in-out forwards;
        }
        .book-shadow-prev-front {
          animation: shadowSweepPrevFront 0.65s ease-in-out forwards;
        }
        .book-shadow-prev-back {
          animation: shadowSweepPrevBack 0.65s ease-in-out forwards;
        }
      `}</style>

      {/* Top indicator & helper */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
        <div className="flex items-center gap-2">
          <BookOutlined className="text-teal-600 text-base" />
          <span className="text-xs font-bold text-slate-800">
            {currentStep.title}
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold border border-slate-200">
            {currentStepIndex === 0
              ? "Closed Book (Front)"
              : currentStepIndex === totalSteps - 1
              ? "Closed Book (Back)"
              : `Spread ${currentStepIndex} of ${totalSteps - 2}`}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {availableSizes && availableSizes.length > 0 && onSelectSize ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Book Size:</span>
              <Select
                size="small"
                value={sizeInfo?.id || sizeInfo?.matchedId}
                onChange={onSelectSize}
                className="w-40"
                options={availableSizes.map((s) => ({
                  value: s.id,
                  label: `${s.name} (${s.width_in || s.width}×${s.height_in || s.height} in)`,
                }))}
              />
            </div>
          ) : (sizeInfo?.dimensions || sizeInfo?.formattedSize || sizeInfo?.name) ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">Book Size:</span>
              <span className="font-semibold text-slate-800">
                {sizeInfo.dimensions || sizeInfo.formattedSize || sizeInfo.name}
              </span>
            </div>
          ) : null}
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Click book edges or arrow buttons to turn pages
          </div>
        </div>
      </div>

      {/* Main 3D Book Stage */}
      <div
        className="w-full relative flex items-center justify-center min-h-[460px] py-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-visible"
        style={{ perspective: "2600px" }}
      >
        {/* Soft studio table pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Ambient Book Soft Drop Shadow */}
        <div className="absolute bottom-4 w-[75%] h-8 bg-black/70 blur-xl rounded-full pointer-events-none" />

        {/* Floating Prev Button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirst || isFlipping}
          className={`absolute left-3 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl flex items-center justify-center transition-all ${
            isFirst || isFlipping ? "opacity-20 cursor-not-allowed" : "hover:scale-110 active:scale-95 cursor-pointer"
          }`}
          title="Previous Page"
        >
          <LeftOutlined className="text-sm font-bold" />
        </button>

        {/* ── CASE 1: ACTIVE TURNING ANIMATION (3D Flipping Leaf) ── */}
        {isFlipping && transitionData && (
          <div
            className="relative w-[94%] bg-white rounded-lg shadow-2xl flex select-none"
            style={{
              maxWidth: (sizeInfo?.spreadRatio || 2) < 1.6 ? "740px" : "840px",
              aspectRatio: `${sizeInfo?.spreadRatio || 2}`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Stationary Left Half */}
            <div
              className="w-1/2 h-full relative overflow-hidden bg-white rounded-l-lg"
              style={{ borderLeft: "3px solid #cbd5e1" }}
            >
              {renderPageFace(transitionData.stationaryLeft, true)}
            </div>

            {/* Stationary Right Half */}
            <div
              className="w-1/2 h-full relative overflow-hidden bg-white rounded-r-lg"
              style={{ borderRight: "3px solid #cbd5e1" }}
            >
              {renderPageFace(transitionData.stationaryRight, false)}
            </div>

            {/* 3D Flipping Leaf */}
            <div
              className={`absolute top-0 bottom-0 ${
                flipDirection === "next"
                  ? "left-1/2 w-1/2 origin-left book-leaf-turning-next"
                  : "left-0 w-1/2 origin-right book-leaf-turning-prev"
              }`}
              style={{
                transformStyle: "preserve-3d",
                zIndex: 60,
              }}
            >
              {/* Front Face */}
              <div
                className="absolute inset-0 overflow-hidden bg-white rounded-r-lg"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  borderRight: flipDirection === "next" ? "2px solid #cbd5e1" : "none",
                  borderLeft: flipDirection === "prev" ? "2px solid #cbd5e1" : "none",
                }}
              >
                {renderPageFace(transitionData.leafFront, flipDirection === "prev")}
                <div
                  className={`absolute inset-0 pointer-events-none ${
                    flipDirection === "next"
                      ? "book-shadow-next-front bg-gradient-to-r from-black/40 via-black/20 to-transparent"
                      : "book-shadow-prev-front bg-gradient-to-l from-black/40 via-black/20 to-transparent"
                  }`}
                />
              </div>

              {/* Back Face */}
              <div
                className="absolute inset-0 overflow-hidden bg-white rounded-l-lg"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  borderLeft: flipDirection === "next" ? "2px solid #cbd5e1" : "none",
                  borderRight: flipDirection === "prev" ? "2px solid #cbd5e1" : "none",
                }}
              >
                {renderPageFace(transitionData.leafBack, flipDirection === "next")}
                <div
                  className={`absolute inset-0 pointer-events-none ${
                    flipDirection === "next"
                      ? "book-shadow-next-back bg-gradient-to-l from-black/40 via-black/20 to-transparent"
                      : "book-shadow-prev-back bg-gradient-to-r from-black/40 via-black/20 to-transparent"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── CASE 2: STATIC FRONT COVER (Single Closed Book) ── */}
        {!isFlipping && currentStep.type === "cover_front" && (
          <div
            onClick={handleNext}
            className="relative max-w-[420px] w-[85%] rounded-r-xl rounded-l-xs overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01]"
            style={{
              aspectRatio: `${sizeInfo?.singlePageRatio || 1}`,
              boxShadow:
                "-12px 0 24px -4px rgba(0,0,0,0.7), 16px 20px 40px rgba(0,0,0,0.5), inset 3px 0 6px rgba(255,255,255,0.4)",
              borderTop: "2px solid rgba(255,255,255,0.2)",
              borderRight: "4px solid #cbd5e1",
              borderBottom: "4px solid #94a3b8",
            }}
          >
            {/* Hardcover Spine Ridge on Left */}
            <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none z-30" />
            <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-black/30 shadow-xs pointer-events-none z-30" />

            {/* Canvas Rendering */}
            <div className="w-full h-full relative">
              {renderCanvas(currentStep.page, false)}
            </div>

            {/* Stacked Pages Edge Texture on Right */}
            <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-r from-slate-200 to-slate-400 opacity-90 pointer-events-none z-20 border-l border-slate-300" />

            {/* Hover overlay inviting to Open */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity z-30 pointer-events-none backdrop-blur-2xs">
              <BookOutlined className="text-3xl mb-2 text-teal-400 animate-pulse" />
              <span className="font-bold text-sm tracking-wide bg-black/60 px-4 py-1.5 rounded-full border border-white/20">
                Click to Open Book 📖
              </span>
            </div>
          </div>
        )}

        {/* ── CASE 3: STATIC SPREAD (Open 2-Page Realistic Layout) ── */}
        {!isFlipping && currentStep.type === "spread" && (
          <div
            className="relative w-[94%] bg-white rounded-lg overflow-hidden flex transition-all duration-400"
            style={{
              maxWidth: (sizeInfo?.spreadRatio || 2) < 1.6 ? "740px" : "840px",
              aspectRatio: `${sizeInfo?.spreadRatio || 2}`,
              boxShadow:
                "0 25px 60px -15px rgba(0,0,0,0.7), inset 0 0 10px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Left Page */}
            <div
              onClick={handlePrev}
              className="w-1/2 h-full relative overflow-hidden bg-white cursor-pointer group"
              style={{
                borderLeft: "3px solid #cbd5e1",
              }}
              title="Click left page to turn backward"
            >
              {currentStep.leftPage?.is_blank ? (
                <div className="w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center text-slate-300 select-none">
                  <span className="text-xs uppercase tracking-widest font-serif opacity-40">
                    Inside Cover
                  </span>
                </div>
              ) : (
                renderCanvas(currentStep.leftPage, false)
              )}
            </div>

            {/* Right Page */}
            <div
              onClick={handleNext}
              className="w-1/2 h-full relative overflow-hidden bg-white cursor-pointer group"
              style={{
                borderRight: "3px solid #cbd5e1",
              }}
              title="Click right page to turn forward"
            >
              {currentStep.rightPage?.is_blank ? (
                <div className="w-full h-full bg-[#fdfdfd] flex flex-col items-center justify-center text-slate-300 select-none">
                  <span className="text-xs uppercase tracking-widest font-serif opacity-40">
                    Inside Back Cover
                  </span>
                </div>
              ) : (
                renderCanvas(currentStep.rightPage, false)
              )}
            </div>
          </div>
        )}

        {/* ── CASE 4: STATIC BACK COVER (Single Closed Book) ── */}
        {!isFlipping && currentStep.type === "cover_back" && (
          <div
            onClick={handlePrev}
            className="relative max-w-[420px] w-[85%] rounded-l-xl rounded-r-xs overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01]"
            style={{
              aspectRatio: `${sizeInfo?.singlePageRatio || 1}`,
              boxShadow:
                "12px 0 24px -4px rgba(0,0,0,0.7), -16px 20px 40px rgba(0,0,0,0.5), inset -3px 0 6px rgba(255,255,255,0.4)",
              borderTop: "2px solid rgba(255,255,255,0.2)",
              borderLeft: "4px solid #cbd5e1",
              borderBottom: "4px solid #94a3b8",
            }}
            title="Click to Open Photobook Backward"
          >
            {/* Hardcover Spine Ridge on Right */}
            <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-black/50 via-black/20 to-transparent pointer-events-none z-30" />
            <div className="absolute top-0 bottom-0 right-5 w-0.5 bg-black/30 shadow-xs pointer-events-none z-30" />

            {/* Canvas Rendering */}
            <div className="w-full h-full relative">
              {renderCanvas(currentStep.page, false)}
            </div>

            {/* Stacked Pages Edge Texture on Left */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-l from-slate-200 to-slate-400 opacity-90 pointer-events-none z-20 border-r border-slate-300" />

            {/* Hover overlay inviting to Flip Back */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity z-30 pointer-events-none backdrop-blur-2xs">
              <BookOutlined className="text-3xl mb-2 text-teal-400 animate-pulse" />
              <span className="font-bold text-sm tracking-wide bg-black/60 px-4 py-1.5 rounded-full border border-white/20">
                Click to Open Previous Page 📖
              </span>
            </div>
          </div>
        )}

        {/* Floating Next Button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={isLast || isFlipping}
          className={`absolute right-3 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl flex items-center justify-center transition-all ${
            isLast || isFlipping ? "opacity-20 cursor-not-allowed" : "hover:scale-110 active:scale-95 cursor-pointer"
          }`}
          title="Next Page"
        >
          <RightOutlined className="text-sm font-bold" />
        </button>
      </div>

      {/* Bottom Interactive Navigation & Thumbnail Strip */}
      <div className="w-full flex flex-col items-center gap-3 mt-4">
        <div className="flex items-center gap-3">
          <Button
            icon={<LeftOutlined />}
            disabled={isFirst || isFlipping}
            onClick={handlePrev}
            className="!rounded-lg font-semibold"
          >
            {currentStepIndex === 1 ? "Close Book (Front)" : "Previous Page"}
          </Button>

          <div className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 border border-slate-200 flex items-center gap-2">
            <span>{currentStep.title}</span>
            <span className="text-slate-400 font-normal">
              ({currentStepIndex + 1} / {totalSteps})
            </span>
          </div>

          <Button
            icon={<RightOutlined />}
            disabled={isLast || isFlipping}
            onClick={handleNext}
            className="!rounded-lg !bg-[#00a896] hover:!bg-[#008f80] !text-white font-semibold !border-[#00a896]"
          >
            {currentStepIndex === 0
              ? "Open Book 📖"
              : currentStepIndex === totalSteps - 2
              ? "Close Book (Back)"
              : "Next Page"}
          </Button>
        </div>

        {/* Thumbnail Quick Selector Dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full px-2 py-1">
          {steps.map((st, sIdx) => (
            <button
              key={sIdx}
              type="button"
              onClick={() => onStepChange(sIdx)}
              title={st.title}
              className={`transition-all rounded-full cursor-pointer ${
                sIdx === currentStepIndex
                  ? "w-7 h-2 bg-[#00a896]"
                  : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Curated Google Fonts for Page Text Typography ─────────────────────────────
const AVAILABLE_FONTS = [
  { name: "Playfair Display", label: "Playfair (Classic Serif)" },
  { name: "Montserrat", label: "Montserrat (Modern Clean)" },
  { name: "Great Vibes", label: "Great Vibes (Elegant Script)" },
  { name: "Dancing Script", label: "Dancing Script (Casual Script)" },
  { name: "Cinzel", label: "Cinzel (Timeless Roman)" },
  { name: "Cormorant Garamond", label: "Cormorant (Romantic Serif)" },
  { name: "Caveat", label: "Caveat (Handwritten)" },
  { name: "Roboto", label: "Roboto (Neutral Sans)" },
  { name: "Inter", label: "Inter (Crisp Sans)" },
  { name: "Merriweather", label: "Merriweather (Editorial Serif)" },
  { name: "Jost", label: "Jost (Geometric Sans)" },
];

// ── Curated Color Swatches for Page Text Typography ───────────────────────────
const AVAILABLE_COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#1e293b", label: "Charcoal" },
  { value: "#475569", label: "Slate" },
  { value: "#ffffff", label: "White" },
  { value: "#d97706", label: "Amber Gold" },
  { value: "#b45309", label: "Warm Bronze" },
  { value: "#e11d48", label: "Rose Crimson" },
  { value: "#db2777", label: "Vibrant Pink" },
  { value: "#7c3aed", label: "Royal Purple" },
  { value: "#00a896", label: "Teal" },
  { value: "#1d4ed8", label: "Classic Navy" },
  { value: "#15803d", label: "Forest Green" },
];

// ── Color Luminance & Contrast Checker (White Family vs Dark Family) ──────────
export const isWhiteFamilyColor = (color) => {
  if (!color || typeof color !== "string") return false;
  const c = color.trim().toLowerCase();
  if (c === "white" || c === "#ffffff" || c === "#fff" || c === "rgb(255,255,255)") return true;

  // Hex color
  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((ch) => ch + ch).join("");
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // Relative perceived luminance formula
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.65;
    }
  }

  // RGB / RGBA color
  const rgbMatch = c.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
  }

  return false;
};

// ── Preset Standard Studio Photobook Sizes (Matching Printshoppy UI) ─────────
export const PRESET_STUDIO_SIZES = [
  { id: "A5", name: "A5", orientation: "HORIZONTAL", width: 8.33, height: 5.8, unit: "in", dimensions: "8.33 × 5.8 in", popular: false },
  { id: "A4", name: "A4", orientation: "HORIZONTAL", width: 11.67, height: 8.34, unit: "in", dimensions: "11.67 × 8.34 in", popular: true },
  { id: "A3", name: "A3", orientation: "HORIZONTAL", width: 17.0, height: 11.8, unit: "in", dimensions: "17 × 11.8 in", popular: false },
  { id: "A4 V", name: "A4 V", orientation: "VERTICAL", width: 8.3, height: 11.33, unit: "in", dimensions: "8.3 × 11.33 in", popular: false },
  { id: "Square", name: "Square", orientation: "SQUARE", width: 8.51, height: 8.51, unit: "in", dimensions: "8.51 × 8.51 in", popular: false },
];
export const FRAME_SHAPES = [
  { id: "rectangle", name: "Rectangle", icon: "square", isDefault: true },
  { id: "circle", name: "Circle / Oval", icon: "circle" },
  { id: "heart", name: "Heart", icon: "heart" },
  { id: "star", name: "Star", icon: "star" },
  { id: "hexagon", name: "Hexagon", icon: "hexagon" },
  { id: "arch", name: "Arched Window", icon: "arch" },
  { id: "scallop", name: "Scalloped Flower", icon: "flower" },
];

export const getShapeClipPathDefinition = (shape, cornerRadiusPercent = 0) => {
  switch (shape) {
    case "circle":
      return {
        type: "ellipse",
        attrs: { cx: "0.5", cy: "0.5", rx: "0.5", ry: "0.5" },
      };

    case "heart":
      return {
        type: "path",
        attrs: {
          d: "M 0.5,0.88 C 0.08,0.58 0,0.38 0,0.25 C 0,0.1 0.12,0 0.27,0 C 0.38,0 0.46,0.06 0.5,0.16 C 0.54,0.06 0.62,0 0.73,0 C 0.88,0 1,0.1 1,0.25 C 1,0.38 0.92,0.58 0.5,0.88 Z",
        },
      };

    case "star":
      return {
        type: "polygon",
        attrs: {
          points:
            "0.5,0.02 0.63,0.36 0.98,0.38 0.71,0.61 0.79,0.96 0.5,0.77 0.21,0.96 0.29,0.61 0.02,0.38 0.37,0.36",
        },
      };

    case "hexagon":
      return {
        type: "polygon",
        attrs: {
          points: "0.5,0.02 0.95,0.26 0.95,0.74 0.5,0.98 0.05,0.74 0.05,0.26",
        },
      };

    case "arch":
      return {
        type: "path",
        attrs: {
          d: "M 0,1 L 0,0.45 C 0,0.2 0.22,0 0.5,0 C 0.78,0 1,0.2 1,0.45 L 1,1 Z",
        },
      };

    case "scallop":
      return {
        type: "path",
        attrs: {
          d: "M 0.5,0.05 C 0.58,0 0.68,0.03 0.72,0.1 C 0.77,0.08 0.86,0.12 0.88,0.18 C 0.94,0.21 0.98,0.3 0.97,0.37 C 1.01,0.43 1,0.52 0.96,0.57 C 1,0.63 0.98,0.72 0.92,0.77 C 0.92,0.84 0.86,0.91 0.79,0.92 C 0.76,0.98 0.68,1 0.61,0.98 C 0.56,1.02 0.46,1.02 0.41,0.98 C 0.34,1 0.26,0.98 0.23,0.92 C 0.16,0.91 0.1,0.84 0.1,0.77 C 0.04,0.72 0.02,0.63 0.06,0.57 C 0.02,0.52 0.01,0.43 0.05,0.37 C 0.04,0.3 0.08,0.21 0.14,0.18 C 0.16,0.12 0.25,0.08 0.3,0.1 C 0.34,0.03 0.44,0 0.5,0.05 Z",
        },
      };

    case "rectangle":
    default: {
      const rx = cornerRadiusPercent > 0 ? (Number(cornerRadiusPercent) / 100).toFixed(3) : "0";
      return {
        type: "rect",
        attrs: {
          x: "0",
          y: "0",
          width: "1",
          height: "1",
          rx,
          ry: rx,
        },
      };
    }
  }
};

export const renderShapeSvgClip = (clipDef, isScaled100 = false) => {
  if (!clipDef) return null;
  const { type, attrs } = clipDef;

  if (isScaled100) {
    if (type === "ellipse") return <ellipse cx="50" cy="50" rx="50" ry="50" />;
    if (type === "rect") {
      const rx = Number(attrs.rx || 0) * 100;
      return <rect x="0" y="0" width="100" height="100" rx={rx} ry={rx} />;
    }
    if (type === "path") return <path {...attrs} transform="scale(100, 100)" />;
    if (type === "polygon") return <polygon {...attrs} transform="scale(100, 100)" />;
    return <rect x="0" y="0" width="100" height="100" />;
  }

  if (type === "ellipse") return <ellipse {...attrs} />;
  if (type === "path") return <path {...attrs} />;
  if (type === "polygon") return <polygon {...attrs} />;
  if (type === "rect") return <rect {...attrs} />;
  return <rect x="0" y="0" width="1" height="1" />;
};

/**
 * Dynamically measures text width and height in percentage of canvas
 * based on the characters typed, font family, font size, and letter spacing.
 * When empty or whitespace only: width is low (1%).
 * When letters are typed: width increases dynamically according to letters typed.
 */
export const calculateDynamicTextDimensions = ({
  content = "",
  fontSize = 24,
  fontFamily = "Inter",
  fontWeight = "normal",
  fontStyle = "normal",
  letterSpacing = 0,
  lineHeight = 1.2,
  canvasWidth = 707,
  canvasHeight = 1000,
}) => {
  const text = String(content ?? "");
  const numFontSize = Number(fontSize) || 24;
  const numCanvasW = Number(canvasWidth) || 707;
  const numCanvasH = Number(canvasHeight) || 1000;
  const numLetterSpacing = Number(letterSpacing) || 0;
  const numLineHeight = Number(lineHeight) || 1.2;

  // 1. If there is no letter (empty or whitespace only), width is low (1%)
  if (!text || text.trim().length === 0) {
    const minWidthPct = 1.0;
    const minHeightPx = Math.max(16, Math.round(numFontSize * 1.2));
    const minHeightPct = Number(((minHeightPx / numCanvasH) * 100).toFixed(2));
    return {
      width_pct: minWidthPct,
      height_pct: Math.max(1.0, minHeightPct),
    };
  }

  // 2. Measure characters typed using offscreen canvas context
  const lines = text.split("\n");
  let maxLineWidthPx = 0;

  try {
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const fallback = getFontFamilyFallback ? getFontFamilyFallback(fontFamily) : fontFamily;
        ctx.font = `${fontStyle || "normal"} ${fontWeight || "normal"} ${numFontSize}px ${fallback}`;
        for (const line of lines) {
          const metrics = ctx.measureText(line || " ");
          let w = metrics.width;
          if (numLetterSpacing && line.length > 1) {
            w += (line.length - 1) * numLetterSpacing;
          }
          if (w > maxLineWidthPx) maxLineWidthPx = w;
        }
      }
    }
  } catch (err) {}

  if (maxLineWidthPx <= 0) {
    const avgCharW = numFontSize * 0.58;
    for (const line of lines) {
      const w = (line.length * avgCharW) + (line.length * numLetterSpacing);
      if (w > maxLineWidthPx) maxLineWidthPx = w;
    }
  }

  // Generous breathing room for flourishes, cursive swashes, and custom font metrics
  const paddingPx = Math.max(20, Math.round(numFontSize * 0.5));
  const totalWidthPx = maxLineWidthPx + paddingPx;
  const calcWidthPct = Number(((totalWidthPx / numCanvasW) * 100).toFixed(2));
  const finalWidthPct = Math.min(100, Math.max(1.0, calcWidthPct));

  const totalHeightPx = Math.max(
    Math.round(lines.length * (numFontSize * numLineHeight) + 6),
    Math.round(numFontSize * 1.2)
  );
  const calcHeightPct = Number(((totalHeightPx / numCanvasH) * 100).toFixed(2));
  const finalHeightPct = Math.min(100, Math.max(1.0, calcHeightPct));

  return {
    width_pct: finalWidthPct,
    height_pct: finalHeightPct,
  };
};

/**
 * Unified Responsive Paper Coordinate Resolver
 * Resolves element left, top, width, height as clean percentages (%) with respect to the selected paper size.
 * Handles % fields, string percentages, legacy 1000-scale coordinates, and decimal ratios.
 */
export const getElementCoords = (el) => {
  if (!el) return { left: 0, top: 0, width: 100, height: 100 };

  const parseCoord = (val, pctVal, normVal, defaultPct = 0) => {
    // 1. Prioritize canonical percentage fields
    if (pctVal !== undefined && pctVal !== null && !isNaN(Number(pctVal))) {
      return Number(pctVal);
    }
    // 2. Canonical normalized (0.0 to 1.0)
    if (normVal !== undefined && normVal !== null && !isNaN(Number(normVal))) {
      return +(Number(normVal) * 100).toFixed(4);
    }
    // 3. String percentages (e.g. "25.5%")
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.endsWith("%")) {
        const num = parseFloat(trimmed);
        if (!isNaN(num)) return num;
      }
      const num = parseFloat(trimmed);
      if (!isNaN(num)) val = num;
    }
    // 4. Numeric parsing
    if (typeof val === "number" && !isNaN(val)) {
      if ((el.unit === "%" || el.is_percentage) && val <= 100) {
        return val;
      }
      // Legacy 1000-scale coordinates (e.g. 500 = 50%, 100 = 10%)
      if (val > 100) {
        return +((val / 1000) * 100).toFixed(4);
      }
      // Normalized decimal (0 to 1)
      if (val > 0 && val <= 1) {
        return +(val * 100).toFixed(4);
      }
      // For val between 1 and 100: if sibling dimensions are > 100, this is legacy 1000-scale
      if (Number(el.width) > 100 || Number(el.height) > 100) {
        return +((val / 1000) * 100).toFixed(4);
      }
      // Otherwise it's already a percentage
      return val;
    }
    return defaultPct;
  };

  const parseDimension = (val, pctVal, normVal, defaultPct = 100) => {
    if (pctVal !== undefined && pctVal !== null && !isNaN(Number(pctVal))) {
      return Number(pctVal);
    }
    if (normVal !== undefined && normVal !== null && !isNaN(Number(normVal))) {
      return +(Number(normVal) * 100).toFixed(4);
    }
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.endsWith("%")) {
        const num = parseFloat(trimmed);
        if (!isNaN(num)) return num;
      }
      const num = parseFloat(trimmed);
      if (!isNaN(num)) val = num;
    }
    if (typeof val === "number" && !isNaN(val)) {
      if ((el.unit === "%" || el.is_percentage) && val <= 100) {
        return val;
      }
      if (val > 100) {
        return +((val / 1000) * 100).toFixed(4);
      }
      if (val > 0 && val <= 1) {
        return +(val * 100).toFixed(4);
      }
      return val;
    }
    return defaultPct;
  };

  const isText = el.type === "text";
  let left = parseCoord(el.x, el.x_pct, el.x_norm, 0);
  let top = parseCoord(el.y, el.y_pct, el.y_norm, 0);
  let width = parseDimension(el.width, el.width_pct, el.w_norm, 100);
  let height = parseDimension(el.height, el.height_pct, el.h_norm, 100);

  // For text elements: width & height are dynamically calculated based on typed characters
  if (isText) {
    const dynamicDims = calculateDynamicTextDimensions({
      content: el.content,
      fontSize: el.font_size,
      fontFamily: el.font_family,
      fontWeight: el.font_weight,
      fontStyle: el.font_style,
      letterSpacing: el.letter_spacing,
      lineHeight: el.line_height,
      canvasWidth: 707,
      canvasHeight: 1000,
    });

    width = Math.max(width, dynamicDims.width_pct);
    height = Math.max(height, dynamicDims.height_pct);

    // Only for legacy template elements lacking explicit percentage coordinate, anchor them centered
    if (el.x_pct === undefined && (typeof el.x === "number" && el.x > 1)) {
      const oldWidth = width;
      if ((el.align || "center") === "center") {
        const originalCenter = left + (oldWidth / 2);
        left = Math.max(0, Math.min(100 - width, Number((originalCenter - (width / 2)).toFixed(2))));
      } else if (el.align === "right") {
        const originalRight = left + oldWidth;
        left = Math.max(0, Math.min(100 - width, Number((originalRight - width).toFixed(2))));
      }
    }
  }

  // For text and decoration elements, return exact percentage width and height without bounding box clamping
  if (el.type === "decoration" || el.type === "text") {
    return { left, top, width, height };
  }

  // Allow coordinates to extend beyond 0..100% for full bleed and off-canvas elements
  left = Math.max(-100, Math.min(200, left));
  top = Math.max(-100, Math.min(200, top));
  width = Math.max(1, width);
  height = Math.max(1, height);

  return { left, top, width, height };
};

/**
 * Normalizes an element into canonical page coordinates (percentages and normalized [0,1] floats)
 * ensuring exact cross-device, preview, and print reproduction without drift.
 */
export const normalizeElementToPaperCoords = (el) => {
  if (!el) return el;
  const coords = getElementCoords(el);
  const fontSize = Number(el.font_size) || 24;
  return {
    ...el,
    x_pct: coords.left,
    y_pct: coords.top,
    width_pct: coords.width,
    height_pct: coords.height,
    x_norm: +(coords.left / 100).toFixed(6),
    y_norm: +(coords.top / 100).toFixed(6),
    w_norm: +(coords.width / 100).toFixed(6),
    h_norm: +(coords.height / 100).toFixed(6),
    x_str: `${coords.left}%`,
    y_str: `${coords.top}%`,
    width_str: `${coords.width}%`,
    height_str: `${coords.height}%`,
    unit: "%",
    is_percentage: true,
    font_size_rem: `${(fontSize / 16).toFixed(2)}rem`,
    font_size_cqmin: `${(fontSize / 10).toFixed(2)}cqmin`,
    // Backward compatibility with legacy 1000-scale schema / backend
    x: Math.round(coords.left * 10),
    y: Math.round(coords.top * 10),
    width: Math.round(coords.width * 10),
    height: Math.round(coords.height * 10),
  };
};

/**
 * Extracts decoration definitions and percentage sizes from database templates
 * (from template.pages and template.published_snapshot.pages)
 */
export const extractDatabaseDecorations = (tpl) => {
  if (!tpl) return { list: [], byId: {}, byAsset: {}, byName: {}, defaultDec: null };
  const pages =
    tpl?.published_snapshot?.pages && tpl.published_snapshot.pages.length > 0
      ? tpl.published_snapshot.pages
      : tpl?.pages && tpl.pages.length > 0
      ? tpl.pages
      : [];

  const list = [];
  const byId = {};
  const byAsset = {};
  const byName = {};
  let defaultDec = null;

  pages.forEach((p) => {
    (p.elements || []).forEach((el) => {
      if (el.type === "decoration") {
        const widthPct =
          el.width_pct !== undefined && el.width_pct !== null && !isNaN(Number(el.width_pct))
            ? Number(el.width_pct)
            : el.w_norm !== undefined && el.w_norm !== null && !isNaN(Number(el.w_norm))
            ? Number((Number(el.w_norm) * 100).toFixed(4))
            : typeof el.width_str === "string" && el.width_str.includes("%")
            ? parseFloat(el.width_str)
            : el.width > 100
            ? Number(((Number(el.width) / 1000) * 100).toFixed(4))
            : Number(el.width) || 15.52;

        const heightPct =
          el.height_pct !== undefined && el.height_pct !== null && !isNaN(Number(el.height_pct))
            ? Number(el.height_pct)
            : el.h_norm !== undefined && el.h_norm !== null && !isNaN(Number(el.h_norm))
            ? Number((Number(el.h_norm) * 100).toFixed(4))
            : typeof el.height_str === "string" && el.height_str.includes("%")
            ? parseFloat(el.height_str)
            : el.height > 100
            ? Number(((Number(el.height) / 1000) * 100).toFixed(4))
            : Number(el.height) || 13.23;

        const xPct =
          el.x_pct !== undefined && el.x_pct !== null && !isNaN(Number(el.x_pct))
            ? Number(el.x_pct)
            : el.x_norm !== undefined && el.x_norm !== null && !isNaN(Number(el.x_norm))
            ? Number((Number(el.x_norm) * 100).toFixed(4))
            : typeof el.x_str === "string" && el.x_str.includes("%")
            ? parseFloat(el.x_str)
            : el.x > 100
            ? Number(((Number(el.x) / 1000) * 100).toFixed(4))
            : Number(el.x) || 0;

        const yPct =
          el.y_pct !== undefined && el.y_pct !== null && !isNaN(Number(el.y_pct))
            ? Number(el.y_pct)
            : el.y_norm !== undefined && el.y_norm !== null && !isNaN(Number(el.y_norm))
            ? Number((Number(el.y_norm) * 100).toFixed(4))
            : typeof el.y_str === "string" && el.y_str.includes("%")
            ? parseFloat(el.y_str)
            : el.y > 100
            ? Number(((Number(el.y) / 1000) * 100).toFixed(4))
            : Number(el.y) || 0;

        const decInfo = {
          ...el,
          width_pct: widthPct,
          height_pct: heightPct,
          x_pct: xPct,
          y_pct: yPct,
          width_str: `${widthPct}%`,
          height_str: `${heightPct}%`,
          x_str: `${xPct}%`,
          y_str: `${yPct}%`,
          w_norm: +(widthPct / 100).toFixed(6),
          h_norm: +(heightPct / 100).toFixed(6),
          x_norm: +(xPct / 100).toFixed(6),
          y_norm: +(yPct / 100).toFixed(6),
          fit_mode: el.fit_mode || "contain",
          aspect_ratio: el.aspect_ratio || (widthPct && heightPct ? widthPct / heightPct : undefined),
          asset_url: el.asset_url || "",
          name: el.name || "Decoration",
          svg: el.svg || "",
          unit: "%",
          is_percentage: true,
        };

        list.push(decInfo);
        if (el.id) byId[el.id] = decInfo;
        if (el.asset_url) byAsset[el.asset_url] = decInfo;
        if (el.name) byName[el.name.toLowerCase().trim()] = decInfo;
        if (!defaultDec || (el.asset_url && (el.width_pct || el.width_str))) {
          defaultDec = decInfo;
        }
      }
    });
  });

  return { list, byId, byAsset, byName, defaultDec };
};

/**
 * Resolves decoration element image sizes from database template definitions
 * ensuring all pages with type="decoration" use exact database percentage dimensions
 */
export const resolveDbDecorationData = (el, dbDecDefinitions) => {
  if (!el || el.type !== "decoration") return el;
  if (!dbDecDefinitions) return el;
  const { byId, byAsset, byName, defaultDec } = dbDecDefinitions;

  const matched =
    (el.id && byId[el.id]) ||
    (el.asset_url && byAsset[el.asset_url]) ||
    (el.name && byName[el.name.toLowerCase().trim()]) ||
    (el.asset_url ? defaultDec : null) ||
    defaultDec;

  if (!matched) {
    return {
      ...el,
      svg: el.svg || resolveDecorationSvg(el),
    };
  }

  return {
    ...el,
    width_pct: el.width_pct !== undefined && el.width_pct !== null && !isNaN(Number(el.width_pct))
      ? Number(el.width_pct)
      : matched.width_pct,
    height_pct: el.height_pct !== undefined && el.height_pct !== null && !isNaN(Number(el.height_pct))
      ? Number(el.height_pct)
      : matched.height_pct,
    x_pct: el.x_pct !== undefined && el.x_pct !== null && !isNaN(Number(el.x_pct))
      ? Number(el.x_pct)
      : matched.x_pct,
    y_pct: el.y_pct !== undefined && el.y_pct !== null && !isNaN(Number(el.y_pct))
      ? Number(el.y_pct)
      : matched.y_pct,
    width_str: el.width_str || matched.width_str,
    height_str: el.height_str || matched.height_str,
    x_str: el.x_str || matched.x_str,
    y_str: el.y_str || matched.y_str,
    w_norm: el.w_norm !== undefined ? el.w_norm : matched.w_norm,
    h_norm: el.h_norm !== undefined ? el.h_norm : matched.h_norm,
    x_norm: el.x_norm !== undefined ? el.x_norm : matched.x_norm,
    y_norm: el.y_norm !== undefined ? el.y_norm : matched.y_norm,
    fit_mode: el.fit_mode || matched.fit_mode || "contain",
    aspect_ratio: el.aspect_ratio || matched.aspect_ratio,
    asset_url: el.asset_url || matched.asset_url || "",
    name: el.name || matched.name || "Decoration",
    svg: el.svg || matched.svg || resolveDecorationSvg(el),
    unit: "%",
    is_percentage: true,
  };
};

const PhotoBookEditorPage = () => {
  const { product_name, current_working_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authSlice?.user);

  // ── States ─────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [designData, setDesignData] = useState(null);
  const [templateData, setTemplateData] = useState(DEFAULT_VINTAGE_TEMPLATE);
  const [allTemplatesList, setAllTemplatesList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState("All changes saved");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [photoFilter, setPhotoFilter] = useState("all"); // "all" | "unused" | "placed"

  // 4-Step Workflow: 1: Your Book, 2: Upload Photos, 3: Edit Your Book, 4: Review & Cart
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
  const [isAddToCartConfirmModalOpen, setIsAddToCartConfirmModalOpen] = useState(false);

  // Active Tool in Step 3 Workspace: "add" | "arrange" | "size" | "design" | "options" | null
  const [activeStudioTool, setActiveStudioTool] = useState("add");

  // Album Specifications
  const [photoBookPages, setPhotoBookPages] = useState(20);
  const [selectedSize, setSelectedSize] = useState(() => {
    return localStorage.getItem("photobook_selected_size") || "A4";
  });
  const [selectedVariant, setSelectedVariant] = useState("170 gsm Premium Photo Paper");
  const [selectedTemplateName, setSelectedTemplateName] = useState("Vintage Wedding Book");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedCoverFinish, setSelectedCoverFinish] = useState("Matte"); // "Matte" | "Glossy" | "Leatherette"
  const [selectedPaperType, setSelectedPaperType] = useState("170gsm"); // "170gsm" | "250gsm" | "300gsm"
  const [includeGiftBox, setIncludeGiftBox] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Arrange Tool Drag-and-Drop States
  const [draggedArrangeIndex, setDraggedArrangeIndex] = useState(null);
  const [dragOverArrangeIndex, setDragOverArrangeIndex] = useState(null);
  const sidebarPhotoInputRef = useRef(null);


  // ── Alert on Tab Close with Unsaved Changes ─────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes in your photo book. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  // Published themes available to customer (Storefront visible & active)
  const availableTemplates = useMemo(() => {
    let list = [];
    if (allTemplatesList && allTemplatesList.length > 0) {
      list = allTemplatesList;
    } else {
      const productTemplates = productData?.photobook_config?.templates || [];
      if (productTemplates.length > 0) list = productTemplates;
      else list = [templateData || DEFAULT_VINTAGE_TEMPLATE];
    }
    return list.filter((t) => t.storefront_visibility !== false && t.is_active !== false);
  }, [allTemplatesList, productData, templateData]);

  // ── Template Sizes: Only sizes created for the active template ────────────
  const templateSizes = useMemo(() => {
    const photobookConfig = productData?.photobook_config || {};
    const configSizes = photobookConfig.sizes || [];
    const productTemplates = photobookConfig.templates || [];

    // 1. Resolve active template from productData / templateData / designData
    const candidateIds = [
      selectedTemplateId,
      selectedTemplateName,
      templateData?.template_id,
      templateData?.template_name,
      templateData?._id,
      templateData?.slug,
      designData?.template_id,
      designData?.template_name,
    ]
      .filter(Boolean)
      .map((x) => String(x).trim().toLowerCase());

    const matchedProductTemplate =
      productTemplates.find((t) => {
        const tid = String(t._id || "").trim().toLowerCase();
        const tslug = String(t.slug || "").trim().toLowerCase();
        const ttplid = String(t.template_id || "").trim().toLowerCase();
        const tname = String(t.template_name || "").trim().toLowerCase();
        return candidateIds.some(
          (cid) => cid === tid || cid === tslug || cid === ttplid || cid === tname
        );
      }) ||
      productTemplates[0] ||
      null;

    // Helper to build a complete size object with width, height, unit, dimensions, orientation
    const buildSizeObject = (szItem, fallbackIndex = 0) => {
      if (typeof szItem === "object" && szItem !== null) {
        const name = szItem.name || szItem.title || `Size ${fallbackIndex + 1}`;
        const id = szItem._id || szItem.id || name;
        let width_in = Number(szItem.width_in);
        let height_in = Number(szItem.height_in);
        let width_cm = Number(szItem.width_cm);
        let height_cm = Number(szItem.height_cm);

        // Derive cm from in or in from cm if one is missing
        if ((!width_in || !height_in) && width_cm && height_cm) {
          width_in = +(width_cm / 2.54).toFixed(2);
          height_in = +(height_cm / 2.54).toFixed(2);
        } else if ((!width_cm || !height_cm) && width_in && height_in) {
          width_cm = +(width_in * 2.54).toFixed(1);
          height_cm = +(height_in * 2.54).toFixed(1);
        }

        // Fallbacks if both are 0
        if (!width_in || !height_in) {
          const match = String(name).match(/([0-9.]+)\s*[xX*×]\s*([0-9.]+)/);
          if (match) {
            width_in = parseFloat(match[1]);
            height_in = parseFloat(match[2]);
            width_cm = +(width_in * 2.54).toFixed(1);
            height_cm = +(height_in * 2.54).toFixed(1);
          } else {
            width_in = 8.3;
            height_in = 11.7;
            width_cm = 21.1;
            height_cm = 29.7;
          }
        }

        const orientation =
          Math.abs(width_in - height_in) < 0.2
            ? "SQUARE"
            : width_in > height_in
            ? "HORIZONTAL"
            : "VERTICAL";

        const dimensions = formatBookSizeInches(szItem);

        return {
          id: String(id),
          name,
          orientation,
          width: width_in,
          height: height_in,
          width_in,
          height_in,
          width_cm,
          height_cm,
          unit: "in",
          dimensions,
          is_available: szItem.is_available !== false,
          popular: fallbackIndex === 0,
        };
      }

      // If szItem is a string: e.g. "size-0-1792049163247", "A4", "8x8", etc.
      const strVal = String(szItem).trim();

      // Check match in configSizes
      const matchedConfig = configSizes.find(
        (cs) =>
          cs &&
          (String(cs._id) === strVal ||
            String(cs.name).trim().toLowerCase() === strVal.toLowerCase())
      );
      if (matchedConfig) {
        return buildSizeObject(matchedConfig, fallbackIndex);
      }

      // Check match in PRESET_STUDIO_SIZES
      const matchedPreset = PRESET_STUDIO_SIZES.find(
        (ps) =>
          ps.id.toLowerCase() === strVal.toLowerCase() ||
          ps.name.toLowerCase() === strVal.toLowerCase()
      );
      if (matchedPreset) {
        const width_in = matchedPreset.width;
        const height_in = matchedPreset.height;
        const width_cm = +(width_in * 2.54).toFixed(1);
        const height_cm = +(height_in * 2.54).toFixed(1);
        return {
          ...matchedPreset,
          id: strVal,
          width_in,
          height_in,
          width_cm,
          height_cm,
          dimensions: formatBookSizeInches(matchedPreset),
          popular: fallbackIndex === 0,
        };
      }

      // Parse dimensional string: "8x8", "10x10", "12x12", "8.5x11"
      const match = strVal.match(/([0-9.]+)\s*[xX*×]\s*([0-9.]+)/);
      if (match) {
        const width_in = parseFloat(match[1]);
        const height_in = parseFloat(match[2]);
        const width_cm = +(width_in * 2.54).toFixed(1);
        const height_cm = +(height_in * 2.54).toFixed(1);
        const orientation =
          Math.abs(width_in - height_in) < 0.2
            ? "SQUARE"
            : width_in > height_in
            ? "HORIZONTAL"
            : "VERTICAL";
        return {
          id: strVal,
          name: `${width_in} × ${height_in}`,
          orientation,
          width: width_in,
          height: height_in,
          width_in,
          height_in,
          width_cm,
          height_cm,
          unit: "in",
          dimensions: formatBookSizeInches(matchedPreset),
          popular: fallbackIndex === 0,
        };
      }

      // Fallback
      return {
        id: strVal,
        name: strVal,
        orientation: "SQUARE",
        width: 8,
        height: 8,
        width_in: 8,
        height_in: 8,
        width_cm: 20.3,
        height_cm: 20.3,
        unit: "in",
        dimensions: `${strVal} (8 × 8 in)`,
        popular: fallbackIndex === 0,
      };
    };

    // 2. Collect size keys explicitly configured for this template
    const templateSizeKeys = new Set();

    // From matchedProductTemplate size_images
    if (matchedProductTemplate?.size_images && typeof matchedProductTemplate.size_images === "object") {
      Object.keys(matchedProductTemplate.size_images).forEach((k) => templateSizeKeys.add(k));
    }

    // From matchedProductTemplate editions (pricing_by_size)
    if (Array.isArray(matchedProductTemplate?.editions)) {
      matchedProductTemplate.editions.forEach((ed) => {
        if (ed.pricing_by_size && typeof ed.pricing_by_size === "object") {
          Object.keys(ed.pricing_by_size).forEach((k) => templateSizeKeys.add(k));
        }
        if (ed.size_pricing && typeof ed.size_pricing === "object") {
          Object.keys(ed.size_pricing).forEach((k) => templateSizeKeys.add(k));
        }
      });
    }

    // From matchedProductTemplate.supported_sizes or sizes
    if (Array.isArray(matchedProductTemplate?.supported_sizes)) {
      matchedProductTemplate.supported_sizes.forEach((s) => templateSizeKeys.add(s));
    }
    if (Array.isArray(matchedProductTemplate?.sizes)) {
      matchedProductTemplate.sizes.forEach((s) => templateSizeKeys.add(s));
    }

    // 1. Return all photobook sizes created in photobookConfig
    if (configSizes.length > 0) {
      return configSizes.map((cs, idx) => buildSizeObject(cs, idx));
    }

    // 2. From templateData supported_sizes
    const rawTplSizes =
      Array.isArray(templateData?.supported_sizes) && templateData.supported_sizes.length > 0
        ? templateData.supported_sizes
        : Array.isArray(templateData?.published_snapshot?.supported_sizes) &&
          templateData.published_snapshot.supported_sizes.length > 0
        ? templateData.published_snapshot.supported_sizes
        : null;

    if (rawTplSizes && rawTplSizes.length > 0) {
      return rawTplSizes.map((sz, idx) => buildSizeObject(sz, idx));
    }

    // Final fallback
    return PRESET_STUDIO_SIZES;
  }, [templateData, productData, selectedTemplateName, selectedTemplateId, designData]);

  // Ensure selectedSize matches one of the template sizes (prioritizing designData.size or localStorage)
  useEffect(() => {
    if (templateSizes && templateSizes.length > 0) {
      try {
        localStorage.setItem("photobook_template_sizes", JSON.stringify(templateSizes));
      } catch (e) {}
    }
    if (isLoading) return;
    if (templateSizes && templateSizes.length > 0) {
      const preferred = designData?.size || (current_working_id ? null : localStorage.getItem("photobook_selected_size"));
      const currentMatched = templateSizes.find(
        (s) =>
          String(s.id).toLowerCase() === String(selectedSize).toLowerCase() ||
          String(s.name).toLowerCase() === String(selectedSize).toLowerCase()
      );
      if (!currentMatched) {
        const prefMatched = templateSizes.find(
          (s) =>
            String(s.id).toLowerCase() === String(preferred).toLowerCase() ||
            String(s.name).toLowerCase() === String(preferred).toLowerCase()
        );
        const targetId = prefMatched ? prefMatched.id : templateSizes[0].id;
        setSelectedSize(targetId);
        localStorage.setItem("photobook_selected_size", targetId);
      }
    }
  }, [templateSizes, designData?.size, isLoading, current_working_id]);

  // ── Dynamic Aspect Ratio Computation based on Selected Size (cm, in, name) ──
  const activeSizeInfo = useMemo(() => {
    const sizeVal = selectedSize || designData?.size || templateSizes[0]?.id || "8x8";

    // 1. Check against templateSizes
    const tplMatch = templateSizes.find(
      (s) =>
        s.id.toLowerCase() === String(sizeVal).trim().toLowerCase() ||
        s.name.toLowerCase() === String(sizeVal).trim().toLowerCase()
    );

    let width = tplMatch?.width || 8;
    let height = tplMatch?.height || 8;
    let unit = tplMatch?.unit || "in";
    let displayName = tplMatch?.name || sizeVal;

    if (!tplMatch) {
      // Check dimension pattern like "8x8"
      const match = String(sizeVal).match(/([0-9.]+)\s*[xX*×]\s*([0-9.]+)/);
      if (match) {
        width = parseFloat(match[1]) || 8;
        height = parseFloat(match[2]) || 8;
      }
    }

    const singlePageRatio = +(width / height).toFixed(4); // e.g. 8x8: 1.0 (square), A4 V: ~0.7326 (portrait)
    const spreadRatio = +((width * 2) / height).toFixed(4); // spread: 2 pages side-by-side

    return {
      id: tplMatch?.id || sizeVal,
      name: displayName,
      matchedId: tplMatch?.id || sizeVal,
      width,
      height,
      unit,
      singlePageRatio,
      spreadRatio,
      dimensions: tplMatch?.dimensions || `${width} × ${height} ${unit}`,
      width_in: tplMatch?.width_in || width,
      height_in: tplMatch?.height_in || height,
      width_cm: tplMatch?.width_cm,
      height_cm: tplMatch?.height_cm,
    };
  }, [templateSizes, selectedSize, designData]);

  const handleSizeSelect = (sizeId) => {
    setSelectedSize(sizeId);
    localStorage.setItem("photobook_selected_size", sizeId);
    setHasUnsavedChanges(true);
    const matched = templateSizes.find(
      (s) => s.id === sizeId || s.name === sizeId
    );
    if (matched) {
      message.success(`Updated size to ${matched.name}`);
    }
  };

  // Step 1: "Your Book" - Photo Target & Density Configuration
  const [targetPhotoCount, setTargetPhotoCount] = useState(26);
  const [photosPerPageMode, setPhotosPerPageMode] = useState("template"); // "template" | "1" | "2" | "3" | "4" | "mixed"

  // Uploaded Photos State
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const fileInputRef = useRef(null);

  // Preview Image Modal state
  const [previewModalUrl, setPreviewModalUrl] = useState(null);

  // Drag and drop state for re-ordering uploaded photos
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState(null);

  // Pages Data: array of page objects with template definition and assigned photo frames
  const [pagesData, setPagesData] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedFrameId, setSelectedFrameId] = useState(null);

  // Step 3 Spread Navigation
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [previewSpreadIndex, setPreviewSpreadIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 3-Container Split Layout States
  const [activeTool, setActiveTool] = useState(null); // 'add' | 'arrange' | 'size' | 'design' | 'options' | null
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewSpreadModalIndex, setPreviewSpreadModalIndex] = useState(0);
  const centerScrollRef = useRef(null);

  // Page Customization Modal States
  const [editingModalOpen, setEditingModalOpen] = useState(false);
  const [editingPageDraft, setEditingPageDraft] = useState(null);
  const [modalSubView, setModalSubView] = useState("page"); // "page" | "text"
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [textFormDraft, setTextFormDraft] = useState({
    id: null,
    content: "",
    font_family: "Playfair Display",
    font_size: 28,
    color: "#1e293b",
    align: "center",
    x: 100,
    y: 820,
    width: 800,
    height: 60,
  });
  const addMenuRef = useRef(null);
  const [splitRatio, setSplitRatio] = useState(50); // percentage for 2-photo divider (default 50)
  const [selectedLayoutId, setSelectedLayoutId] = useState("theme");
  const [isReplacePhotoModalOpen, setIsReplacePhotoModalOpen] = useState(false);
  const [targetPhotoIndexForChange, setTargetPhotoIndexForChange] = useState(null);
  const [modalUndoStack, setModalUndoStack] = useState([]);
  const [modalRedoStack, setModalRedoStack] = useState([]);
  const canvasContainerRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  // Admin-like Element Selection & Interactive Transform States inside Page Modal
  const [selectedModalElementId, setSelectedModalElementId] = useState(null);
  const [activeModalTransform, setActiveModalTransform] = useState(null);
  const lastModalElementClickRef = useRef(0);

  const [dragOverFrameId, setDragOverFrameId] = useState(null);
  const [isBgRepositionModalOpen, setIsBgRepositionModalOpen] = useState(false);
  const bgFileInputRef = useRef(null);

  // Photoshop-like Transform & Tool States for Customer Side
  const [activeCustomerTransform, setActiveCustomerTransform] = useState(null);
  const [cropModalFrame, setCropModalFrame] = useState(null); // Frame being cropped
  const [targetPhotoSlot, setTargetPhotoSlot] = useState(null); // Target slot when clicking empty frame

  // ── Inject Complete Google Fonts Suite for Consistent Typography ───────────
  useEffect(() => {
    const fontLinkId = "photobook-template-fonts";
    let link = document.getElementById(fontLinkId);
    if (!link) {
      link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href =
      "https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Cinzel:wght@400..900&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Dancing+Script:wght@400..700&family=Great+Vibes&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Jost:ital,wght@0,100..900;1,100..900&family=Merriweather:ital,wght@0,300..900;1,300..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap";
  }, []);

  // ── Mouse Listeners for Photoshop-like Drag & Drop / Resize Transform ──────
  useEffect(() => {
    if (!activeCustomerTransform) return;

    const handleMouseMove = (e) => {
      const {
        type,
        handle,
        elementId,
        pageId,
        startX,
        startY,
        initialLeftPct,
        initialTopPct,
        initialWPct,
        initialHPct,
        initialX,
        initialY,
        initialW,
        initialH,
        containerWidth,
        containerHeight,
      } = activeCustomerTransform;

      if (!containerWidth || !containerHeight) return;

      const deltaXPct = ((e.clientX - startX) / containerWidth) * 100;
      const deltaYPct = ((e.clientY - startY) / containerHeight) * 100;

      const baseLeft = initialLeftPct ?? (initialX != null ? (initialX > 100 ? (initialX / 1000) * 100 : initialX) : 0);
      const baseTop = initialTopPct ?? (initialY != null ? (initialY > 100 ? (initialY / 1000) * 100 : initialY) : 0);
      const baseW = initialWPct ?? (initialW != null ? (initialW > 100 ? (initialW / 1000) * 100 : initialW) : 20);
      const baseH = initialHPct ?? (initialH != null ? (initialH > 100 ? (initialH / 1000) * 100 : initialH) : 20);

      const targetEl = (editingPageDraft?.elements || []).find(
        (el) => el.id === elementId || el.frame_id === elementId
      );
      const is1to1Shape =
        targetEl?.type === "photo_frame" &&
        ["circle", "heart", "star", "scallop", "hexagon"].includes(targetEl?.shape);

      if (type === "move") {
        const nextLeftPct = +(Math.max(-100, Math.min(200, baseLeft + deltaXPct))).toFixed(3);
        const nextTopPct = +(Math.max(-100, Math.min(200, baseTop + deltaYPct))).toFixed(3);
        const legacyX = Math.round(nextLeftPct * 10);
        const legacyY = Math.round(nextTopPct * 10);

        const updateEl = (el) => {
          if (el.id === elementId || el.frame_id === elementId) {
            return {
              ...el,
              x_pct: nextLeftPct,
              y_pct: nextTopPct,
              x_norm: +(nextLeftPct / 100).toFixed(6),
              y_norm: +(nextTopPct / 100).toFixed(6),
              x_str: `${nextLeftPct}%`,
              y_str: `${nextTopPct}%`,
              unit: "%",
              is_percentage: true,
              x: legacyX,
              y: legacyY,
              ...(el.type === "text"
                ? {
                    width_pct: baseW,
                    height_pct: baseH,
                    width_str: `${baseW}%`,
                    height_str: `${baseH}%`,
                    width: Math.round(baseW * 10),
                    height: Math.round(baseH * 10),
                  }
                : {}),
            };
          }
          return el;
        };

        setPagesData((prev) =>
          prev.map((pg) => {
            if (pg.page_id !== pageId && pg.page_number !== pageId) return pg;
            return {
              ...pg,
              elements: (pg.elements || []).map(updateEl),
            };
          })
        );

        if (editingPageDraft && (editingPageDraft.page_id === pageId || editingPageDraft.page_number === pageId)) {
          setEditingPageDraft((prev) => ({
            ...prev,
            elements: (prev.elements || []).map(updateEl),
          }));
        }
      } else if (type === "resize") {
        let newLeftPct = baseLeft;
        let newTopPct = baseTop;
        let newWPct = baseW;
        let newHPct = baseH;

        if (handle.includes("e")) {
          newWPct = +(Math.max(5, Math.min(100 - baseLeft, baseW + deltaXPct))).toFixed(3);
        }
        if (handle.includes("s")) {
          newHPct = +(Math.max(5, Math.min(100 - baseTop, baseH + deltaYPct))).toFixed(3);
        }
        if (handle.includes("w")) {
          const possibleW = Math.max(5, Math.min(baseLeft + baseW, baseW - deltaXPct));
          newLeftPct = +(baseLeft + (baseW - possibleW)).toFixed(3);
          newWPct = +(possibleW).toFixed(3);
        }
        if (handle.includes("n")) {
          const possibleH = Math.max(5, Math.min(baseTop + baseH, baseH - deltaYPct));
          newTopPct = +(baseTop + (baseH - possibleH)).toFixed(3);
          newHPct = +(possibleH).toFixed(3);
        }

        if (is1to1Shape) {
          // Keep width and height uniform for circle, heart, star, scallop frames
          const uniformPct = Math.max(newWPct, newHPct);
          newWPct = uniformPct;
          newHPct = uniformPct;
        }

        const legacyX = Math.round(newLeftPct * 10);
        const legacyY = Math.round(newTopPct * 10);
        const legacyW = Math.round(newWPct * 10);
        const legacyH = Math.round(newHPct * 10);

        const updateEl = (el) => {
          if (el.id === elementId || el.frame_id === elementId) {
            return {
              ...el,
              x_pct: newLeftPct,
              y_pct: newTopPct,
              width_pct: newWPct,
              height_pct: newHPct,
              x_norm: +(newLeftPct / 100).toFixed(6),
              y_norm: +(newTopPct / 100).toFixed(6),
              w_norm: +(newWPct / 100).toFixed(6),
              h_norm: +(newHPct / 100).toFixed(6),
              x_str: `${newLeftPct}%`,
              y_str: `${newTopPct}%`,
              width_str: `${newWPct}%`,
              height_str: `${newHPct}%`,
              unit: "%",
              is_percentage: true,
              x: legacyX,
              y: legacyY,
              width: legacyW,
              height: legacyH,
            };
          }
          return el;
        };

        setPagesData((prev) =>
          prev.map((pg) => {
            if (pg.page_id !== pageId && pg.page_number !== pageId) return pg;
            return {
              ...pg,
              elements: (pg.elements || []).map(updateEl),
            };
          })
        );

        if (editingPageDraft && (editingPageDraft.page_id === pageId || editingPageDraft.page_number === pageId)) {
          setEditingPageDraft((prev) => ({
            ...prev,
            elements: (prev.elements || []).map(updateEl),
          }));
        }
      }
    };

    const handleMouseUp = () => {
      setActiveCustomerTransform(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeCustomerTransform, editingPageDraft]);

  // ── Auto-close "+ Add" popup when clicking outside ────────────────────────
  useEffect(() => {
    if (!isAddMenuOpen) return;
    const handleClickOutside = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddMenuOpen]);

  // ── Specifications & Context Metadata ────────────────────────────────────
  const guestId = useMemo(() => localStorage.getItem("guestId") || "", []);
  const userDisplayName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    if (user?.email) return user.email;
    if (guestId) return `Guest (#${guestId.slice(-6)})`;
    return "Guest Customer";
  }, [user, guestId]);

  const chosenTemplateId = useMemo(() => {
    return (
      designData?.template_id ||
      templateData?._id ||
      templateData?.template_id ||
      "vintage-wedding-book"
    );
  }, [designData, templateData]);

  // ── Min & Max Images Rule (Dynamic based on Pages & Density Mode) ─────────
  const currentPhotoBounds = useMemo(
    () => getPhotoBoundsForDensity(photoBookPages, photosPerPageMode),
    [photoBookPages, photosPerPageMode]
  );
  const minPhotos = currentPhotoBounds.min;
  const maxPhotos = currentPhotoBounds.max;
  const minImages = minPhotos;
  const maxImages = maxPhotos;

  // Pricing calculations: accurately resolved based on selected Template, Edition, and Size
  const priceDetails = useMemo(() => {
    const photobookConfig = productData?.photobook_config || {};
    const templates = photobookConfig.templates || [];
    const sizes = photobookConfig.sizes || [];

    // 1. Resolve active template
    const candidateIds = [
      selectedTemplateId,
      selectedTemplateName,
      templateData?.template_id,
      templateData?.template_name,
      templateData?._id,
      templateData?.slug,
      designData?.template_id,
      designData?.template_name,
    ]
      .filter(Boolean)
      .map((x) => String(x).trim().toLowerCase());

    const matchedTemplate =
      templates.find((t) => {
        const tid = String(t._id || "").trim().toLowerCase();
        const tslug = String(t.slug || "").trim().toLowerCase();
        const ttplid = String(t.template_id || "").trim().toLowerCase();
        const tname = String(t.template_name || "").trim().toLowerCase();
        return candidateIds.some(
          (cid) => cid === tid || cid === tslug || cid === ttplid || cid === tname
        );
      }) ||
      templates[0] ||
      templateData;

    // 2. Resolve active edition
    const editions =
      matchedTemplate?.editions?.length > 0
        ? matchedTemplate.editions
        : templateData?.editions?.length > 0
        ? templateData.editions
        : [];
    const editionNameOrId = String(selectedVariant || designData?.variant || "").trim().toLowerCase();
    const matchedEdition =
      editions.find(
        (e) =>
          (e._id && String(e._id).trim().toLowerCase() === editionNameOrId) ||
          (e.edition_name && String(e.edition_name).trim().toLowerCase() === editionNameOrId) ||
          (e.name && String(e.name).trim().toLowerCase() === editionNameOrId)
      ) ||
      editions[0] ||
      null;

    // 3. Resolve size object & pricing details
    const sizeNameOrId = selectedSize || designData?.size || "8x8";
    const allKnownSizes = [
      ...(templateSizes || []),
      ...(sizes || []),
      ...(photobookConfig.sizes || []),
    ];

    const edPricingDetails = getEditionPricingDetailsForSize(
      matchedEdition,
      sizeNameOrId,
      allKnownSizes
    );

    const matchedSize =
      allKnownSizes.find(
        (s) =>
          (s._id && String(s._id) === String(sizeNameOrId)) ||
          (s.id && String(s.id) === String(sizeNameOrId)) ||
          (s.name && String(s.name).toLowerCase() === String(sizeNameOrId).toLowerCase())
      ) ||
      sizes[0] ||
      null;

    // 4. Base price resolution
    let basePrice = 500;
    if (edPricingDetails?.customerPrice !== null && edPricingDetails?.customerPrice !== undefined) {
      basePrice = edPricingDetails.customerPrice;
    } else if (productData?.customer_product_price) {
      basePrice = Number(productData.customer_product_price);
    } else if (productData?.price) {
      basePrice = Number(productData.price);
    } else if (productData?.MRP_price) {
      basePrice = Number(productData.MRP_price);
    }

    // 5. Default pages, min, and max pages limits
    const basePages = Number(
      edPricingDetails?.defaultPages ||
      matchedEdition?.default_pages ||
      matchedTemplate?.default_pages ||
      templateData?.default_pages ||
      templateData?.page_config?.default_pages ||
      photobookConfig.default_pages ||
      20
    );
    const minPages = Number(
      edPricingDetails?.minPages ||
      matchedEdition?.min_pages ||
      matchedTemplate?.min_pages ||
      templateData?.min_pages ||
      templateData?.page_config?.min_pages ||
      photobookConfig.min_pages ||
      10
    );
    const maxPages = Number(
      edPricingDetails?.maxPages ||
      matchedEdition?.max_pages ||
      matchedTemplate?.max_pages ||
      templateData?.max_pages ||
      templateData?.page_config?.max_pages ||
      photobookConfig.max_pages ||
      60
    );

    // 6. Extra page surcharge price
    let extraPricePerUnit = 0;
    if (edPricingDetails?.extraPagePrice && edPricingDetails.extraPagePrice > 0) {
      extraPricePerUnit = edPricingDetails.extraPagePrice;
    } else if (matchedEdition?.price_per_extra_page !== undefined && matchedEdition?.price_per_extra_page !== null && Number(matchedEdition.price_per_extra_page) > 0) {
      extraPricePerUnit = Number(matchedEdition.price_per_extra_page);
    } else if (matchedTemplate?.price_per_extra_page !== undefined && matchedTemplate?.price_per_extra_page !== null && Number(matchedTemplate.price_per_extra_page) > 0) {
      extraPricePerUnit = Number(matchedTemplate.price_per_extra_page);
    } else if (templateData?.price_per_extra_page !== undefined && templateData?.price_per_extra_page !== null && Number(templateData.price_per_extra_page) > 0) {
      extraPricePerUnit = Number(templateData.price_per_extra_page);
    } else if (matchedSize?.extra_page_price !== undefined && matchedSize?.extra_page_price !== null && Number(matchedSize.extra_page_price) > 0) {
      extraPricePerUnit = Number(matchedSize.extra_page_price);
    } else if (photobookConfig.price_per_extra_page !== undefined && photobookConfig.price_per_extra_page !== null && Number(photobookConfig.price_per_extra_page) > 0) {
      extraPricePerUnit = Number(photobookConfig.price_per_extra_page);
    } else {
      extraPricePerUnit = 15;
    }

    // 8. Extra pages (only charged above base default pages)
    const extraPages = Math.max(0, photoBookPages - basePages);
    const extraPagesCost = extraPages * extraPricePerUnit;
    const taxableTotal = basePrice + extraPagesCost;
    const gstRate = parseFloat(productData?.GST || productData?.gst || 18) || 18;
    const taxAmount = Number(((taxableTotal * gstRate) / 100).toFixed(2));
    const finalTotal = Number((taxableTotal + taxAmount).toFixed(2));

    return {
      basePages,
      minPages,
      maxPages,
      extraPages,
      extraPricePerUnit,
      extraPagesCost,
      basePrice,
      taxableTotal,
      gstRate,
      taxAmount,
      finalTotal,
      matchedEditionName: matchedEdition?.edition_name || selectedVariant,
      matchedSizeName: matchedSize?.name || selectedSize,
      matchedTemplateName: matchedTemplate?.template_name || selectedTemplateName,
    };
  }, [productData, photoBookPages, selectedSize, selectedVariant, selectedTemplateName, selectedTemplateId, designData, templateData]);

  // Enforce page bounds: strictly clamp photoBookPages within minPages and maxPages
  useEffect(() => {
    if (isLoading) return;
    if (priceDetails.maxPages && photoBookPages > priceDetails.maxPages) {
      setPhotoBookPages(priceDetails.maxPages);
    } else if (priceDetails.minPages && photoBookPages < priceDetails.minPages) {
      setPhotoBookPages(priceDetails.minPages);
    }
  }, [priceDetails.maxPages, priceDetails.minPages, photoBookPages, isLoading]);

  // ── Helper: Map Page Number to Template Page Definition ───────────────────
  const resolveTemplatePage = useCallback(
    (pageNumber, totalPages, template) => {
      const tPages =
        template?.published_snapshot?.pages && template.published_snapshot.pages.length > 0
          ? template.published_snapshot.pages
          : template?.pages && template.pages.length > 0
          ? template.pages
          : [];
      if (tPages.length === 0) return null;

      // Filter for interior pages (covers are handled explicitly in buildPagesFromTemplate)
      const interiorTPages = tPages.filter(
        (p) => p.page_type !== "front_cover" && p.page_type !== "back_cover"
      );
      if (interiorTPages.length === 0) return tPages[0] || null;

      // 1. Exact page number match
      const exact = interiorTPages.find(
        (p) =>
          p.targeting_rule?.rule_type === "exact_page" &&
          p.targeting_rule?.page_number === pageNumber
      );
      if (exact) return exact;

      // 2. Odd/Even Interior matches
      if (pageNumber % 2 !== 0) {
        const odd = interiorTPages.find((p) => p.targeting_rule?.rule_type === "odd_interior");
        if (odd) return odd;
      } else {
        const even = interiorTPages.find((p) => p.targeting_rule?.rule_type === "even_interior");
        if (even) return even;
      }

      // 3. General All Interior
      const allInterior = interiorTPages.find((p) => p.targeting_rule?.rule_type === "all_interior");
      if (allInterior) return allInterior;

      // Fallback to first available interior page
      return interiorTPages[0] || tPages[0];
    },
    []
  );

  // ── Build Full Pages Structure from Template & Photos ──────────────────────
  const buildPagesFromTemplate = useCallback(
    (totalPages, template, photos) => {
      let photoCursor = 0;
      const builtPages = [];

      const tPages =
        template?.published_snapshot?.pages && template.published_snapshot.pages.length > 0
          ? template.published_snapshot.pages
          : template?.pages && template.pages.length > 0
          ? template.pages
          : [];

      // 1. Front Cover (receives photo 0)
      const dbDecDefs = extractDatabaseDecorations(template);
      const frontTpl = tPages.find((p) => p.page_type === "front_cover");
      const clonedFrontElements = (frontTpl?.elements || []).map((el) => {
        if (el.type === "photo_frame") {
          const assignedPhoto = (photos && photos[photoCursor]) || null;
          if (assignedPhoto) photoCursor++;
          return {
            ...el,
            photo_url: assignedPhoto ? assignedPhoto.url : (el.photo_url || ""),
            photo_id: assignedPhoto ? assignedPhoto.id : (el.photo_id || ""),
            test_image_url: el.test_image_url || el.sample_image_url || "",
            crop: el.crop || { zoom: 1, offsetX: 0, offsetY: 0 },
            rotation: el.rotation || 0,
          };
        }
        if (el.type === "decoration") {
          return resolveDbDecorationData(el, dbDecDefs);
        }
        return { ...el };
      });

      const frontFallbackPhoto = photos && photos[0] ? photos[0] : null;
      const frontRawList = clonedFrontElements.length > 0 ? clonedFrontElements : [
        {
          id: "front-frame-1",
          frame_id: "cover_frame_1",
          type: "photo_frame",
          x: 80,
          y: 80,
          width: 840,
          height: 700,
          x_pct: 8,
          y_pct: 8,
          width_pct: 84,
          height_pct: 70,
          unit: "%",
          is_percentage: true,
          rotation: 0,
          z_index: 1,
          photo_url: frontFallbackPhoto ? frontFallbackPhoto.url : "",
          test_image_url: "",
        },
        {
          id: "front-text-1",
          type: "text",
          x: 80,
          y: 820,
          width: 840,
          height: 60,
          x_pct: 8,
          y_pct: 82,
          width_pct: 84,
          height_pct: 6,
          unit: "%",
          is_percentage: true,
          content: "OUR BEAUTIFUL MEMORIES",
          font_family: "Playfair Display",
          font_size: 36,
          font_weight: "bold",
          color: "#1e293b",
          align: "center",
          is_customer_editable: true,
        },
      ];

      builtPages.push({
        page_id: "front-cover",
        name: "Front Cover",
        display_label: "Front Cover",
        page_type: "front_cover",
        page_number: "Front Cover",
        background: frontTpl?.background || { type: "color", value: "#ffffff", opacity: 1 },
        elements: frontRawList.map(normalizeElementToPaperCoords),
      });

      // 2. Blank Page (Inside Front Cover) - Only included when admin toggle is ON
      const shouldIncludeBlankPage = Boolean(
        template?.include_blank_page ||
        template?.page_config?.include_blank_page ||
        template?.published_snapshot?.include_blank_page ||
        template?.published_snapshot?.page_config?.include_blank_page
      );

      if (shouldIncludeBlankPage) {
        builtPages.push({
          page_id: "blank-inside-front",
          name: "Blank Page",
          display_label: "Blank Page",
          page_type: "blank",
          page_number: "Blank",
          is_blank: true,
          background: { type: "color", value: "#ffffff", opacity: 1 },
          elements: [],
        });
      }

      // 3. Interior Pages (totalPages includes Front & Back Cover)
      const interiorPagesCount = Math.max(2, totalPages - 2);
      for (let pNum = 1; pNum <= interiorPagesCount; pNum++) {
        const tplPage = resolveTemplatePage(pNum, interiorPagesCount, template);
        const clonedElements = (tplPage?.elements || []).map((el) => {
          if (el.type === "photo_frame") {
            const assignedPhoto = (photos && photos[photoCursor]) || null;
            if (assignedPhoto) photoCursor++;
            return {
              ...el,
              photo_url: assignedPhoto ? assignedPhoto.url : (el.photo_url || ""),
              photo_id: assignedPhoto ? assignedPhoto.id : (el.photo_id || ""),
              test_image_url: el.test_image_url || el.sample_image_url || "",
              crop: el.crop || { zoom: 1, offsetX: 0, offsetY: 0 },
              rotation: el.rotation || 0,
            };
          }
          if (el.type === "decoration") {
            return resolveDbDecorationData(el, dbDecDefs);
          }
          return { ...el };
        });

        const interiorRawList = clonedElements.length > 0 ? clonedElements : [
          {
            id: `p${pNum}-frame-1`,
            frame_id: `p${pNum}_frame_1`,
            type: "photo_frame",
            x: 60,
            y: 80,
            width: 420,
            height: 840,
            x_pct: 6,
            y_pct: 8,
            width_pct: 42,
            height_pct: 84,
            unit: "%",
            is_percentage: true,
            rotation: 0,
            shape: "rectangle",
            fit_mode: "cover",
            photo_url: photos && photos[photoCursor] ? photos[photoCursor++].url : "",
            test_image_url: "",
          },
          {
            id: `p${pNum}-frame-2`,
            frame_id: `p${pNum}_frame_2`,
            type: "photo_frame",
            x: 520,
            y: 80,
            width: 420,
            height: 840,
            x_pct: 52,
            y_pct: 8,
            width_pct: 42,
            height_pct: 84,
            unit: "%",
            is_percentage: true,
            rotation: 0,
            shape: "rectangle",
            fit_mode: "cover",
            photo_url: photos && photos[photoCursor] ? photos[photoCursor++].url : "",
            test_image_url: "",
          },
        ];

        builtPages.push({
          page_number: pNum,
          display_label: `Page ${pNum}`,
          page_id: `page-${pNum}`,
          name: `Page ${pNum}`,
          page_type: "interior",
          background: tplPage?.background || { type: "color", value: "#ffffff", opacity: 1 },
          elements: interiorRawList.map(normalizeElementToPaperCoords),
        });
      }

      // 4. Blank Page (Inside Back Cover) - Only included when admin toggle is ON
      if (shouldIncludeBlankPage) {
        builtPages.push({
          page_id: "blank-inside-back",
          name: "Blank Page",
          display_label: "Blank Page",
          page_type: "blank",
          page_number: "Blank",
          is_blank: true,
          background: { type: "color", value: "#ffffff", opacity: 1 },
          elements: [],
        });
      }

      // 5. Back Cover (receives final photos)
      const backTpl = tPages.find((p) => p.page_type === "back_cover");
      const clonedBackElements = (backTpl?.elements || []).map((el) => {
        if (el.type === "photo_frame") {
          const assignedPhoto = (photos && photos[photoCursor]) || null;
          if (assignedPhoto) photoCursor++;
          return {
            ...el,
            photo_url: assignedPhoto ? assignedPhoto.url : (el.photo_url || ""),
            photo_id: assignedPhoto ? assignedPhoto.id : (el.photo_id || ""),
            test_image_url: el.test_image_url || el.sample_image_url || "",
            crop: el.crop || { zoom: 1, offsetX: 0, offsetY: 0 },
            rotation: el.rotation || 0,
          };
        }
        if (el.type === "decoration") {
          return resolveDbDecorationData(el, dbDecDefs);
        }
        return { ...el };
      });

      const backRawList = clonedBackElements.length > 0 ? clonedBackElements : [
        {
          border: { width: 0, color: "#ffffff", radius: 4 },
          shadow: { blur: 10, color: "rgba(0,0,0,0.15)", offsetX: 0, offsetY: 4 },
          crop: { zoom: 1, offsetX: 0, offsetY: 0 },
          id: "back-frame-1",
          type: "photo_frame",
          x: 60,
          y: 80,
          width: 420,
          height: 840,
          x_pct: 6,
          y_pct: 8,
          width_pct: 42,
          height_pct: 84,
          unit: "%",
          is_percentage: true,
          rotation: 0,
          z_index: 2,
          frame_id: "back_frame_1",
          shape: "rectangle",
          fit_mode: "cover",
          is_required: true,
          photo_url: photos && photos[photoCursor] ? photos[photoCursor++].url : "",
          photo_id: "",
          test_image_url: "",
          content: "",
          is_customer_editable: true,
        },
      ];

      builtPages.push({
        page_id: "back-cover",
        name: "Back Cover",
        display_label: "Back Cover",
        page_type: "back_cover",
        page_number: "Back Cover",
        background: backTpl?.background || { type: "color", value: "#ffffff", opacity: 1 },
        elements: backRawList.map(normalizeElementToPaperCoords),
      });

      return builtPages;
    },
    [resolveTemplatePage]
  );

  // ── Load Design Session, Template, & Product ───────────────────────────────
  useEffect(() => {
    let isCancelled = false;

    const loadStudio = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem("authToken");
        if (!token) {
          message.error("Login is required to customize and save a photo book.");
          localStorage.setItem(
            "redirect_url",
            `/product/${encodeURIComponent(product_name)}/${current_working_id}`
          );
          navigate("/login");
          return;
        }

        const guestId = localStorage.getItem("guestId") || "";

        // 1. Fetch Design
        let design = null;
        if (current_working_id) {
          try {
            const designRes = await getPhotoBookDesign(current_working_id, guestId);
            design = designRes?.data?.data || designRes?.data;
          } catch (e) {
            console.warn("Could not fetch design directly:", e);
            if (e.response?.status === 401) {
              message.error("Session expired. Please log in again.");
              localStorage.setItem(
                "redirect_url",
                `/product/${encodeURIComponent(product_name)}/${current_working_id}`
              );
              navigate("/login");
              return;
            }
            if (e.response?.status === 403) {
              message.error("You do not have permission to access this photo book design.");
              navigate(`/product/${encodeURIComponent(product_name)}`);
              return;
            }
          }
        }

        const searchParams = new URLSearchParams(window.location.search);
        const stepParam = searchParams.get("step");
        const isExplicitResume = searchParams.get("resume") === "true" || stepParam === "3";
        const isExplicitNew = searchParams.get("new") === "true" || stepParam === "1";

        const pageCnt = Number(design?.page_count) || 20;
        setPhotoBookPages(pageCnt);
        if (design?.size) {
          setSelectedSize(design.size);
          localStorage.setItem("photobook_selected_size", design.size);
        }
        if (design?.variant) setSelectedVariant(design.variant);
        if (design?.template_name) setSelectedTemplateName(design.template_name);
        if (design?.template_id) setSelectedTemplateId(design.template_id);
        const covFinish = design?.cover_finish || design?.options?.selectedCoverFinish;
        if (covFinish) setSelectedCoverFinish(covFinish);
        const paperType = design?.options?.selectedPaperType;
        if (paperType) setSelectedPaperType(paperType);
        if (typeof design?.options?.includeGiftBox === "boolean") {
          setIncludeGiftBox(design.options.includeGiftBox);
        }

        const mode = design?.photos_per_page_mode || "template";
        setPhotosPerPageMode(mode);
        const initialBounds = getPhotoBoundsForDensity(pageCnt, mode);
        if (design?.target_photo_count) {
          setTargetPhotoCount(Number(design.target_photo_count));
        } else {
          setTargetPhotoCount(initialBounds.min);
        }

        // 2. Fetch Templates
        let activeTpl = DEFAULT_VINTAGE_TEMPLATE;
        try {
          const tplRes = await getPhotoBookTemplates();
          const allTpls = tplRes?.data?.data || tplRes?.data || [];
          setAllTemplatesList(allTpls);

          const queryTplId = String(searchParams.get("template_id") || "").trim().toLowerCase();
          const queryTplName = String(searchParams.get("template_name") || searchParams.get("template") || "").trim().toLowerCase();

          // When resuming an existing saved book, the saved design is the SINGLE SOURCE OF TRUTH
          const reqTplId = (isExplicitResume || design?.template_id)
            ? String(design?.template_id || "").trim().toLowerCase()
            : (queryTplId || String(design?.template_id || "").trim().toLowerCase());
          const reqTplName = (isExplicitResume || design?.template_name)
            ? String(design?.template_name || "").trim().toLowerCase()
            : (queryTplName || String(design?.template_name || selectedTemplateName || "").trim().toLowerCase());

          let matched = allTpls.find((t) => {
            const tId = String(t.template_id || t._id || t.slug || t.product_template_id || "").trim().toLowerCase();
            const tName = String(t.template_name || t.name || "").trim().toLowerCase();
            return (
              (reqTplId && (tId === reqTplId || tName === reqTplId)) ||
              (reqTplName && (tName === reqTplName || tId === reqTplName))
            );
          });

          // If not matched in allTpls, try fetching directly by ID/slug from backend
          if (!matched && (design?.template_id || reqTplId)) {
            try {
              const fetchId = design?.template_id || reqTplId;
              const directTplRes = await getPhotoBookTemplateById(fetchId);
              const directTpl = directTplRes?.data?.data || directTplRes?.data;
              if (directTpl) {
                matched = directTpl;
              }
            } catch (directErr) {
              console.warn("Direct template fetch by ID failed:", directErr);
            }
          }

          if (!matched) {
            matched = allTpls.find((t) => t.status === "published") || allTpls[0];
          }

          if (matched) {
            activeTpl = matched;
            if (matched.template_name) setSelectedTemplateName(matched.template_name);
            if (matched.template_id || matched._id) {
              setSelectedTemplateId(matched.template_id || matched._id);
            }
            if (matched.page_config?.selected_size && !design?.size) {
              setSelectedSize(matched.page_config.selected_size);
            }
          }
        } catch (e) {
          console.warn("Templates fetch error, using default:", e);
        }
        setTemplateData(activeTpl);

        // 3. Restore or Initialize Uploaded Photos
        let loadedPhotos = [];
        if (design?.uploaded_images && design.uploaded_images.length > 0) {
          loadedPhotos = design.uploaded_images.map((img, idx) => ({
            id: img.id || `photo-${idx}-${Date.now()}`,
            url: img.url || img.path,
            name: img.name || `Photo ${idx + 1}`,
          }));
          setUploadedPhotos(loadedPhotos);
          setMaxUnlockedStep((prev) => Math.max(prev, 2));
        }

        // 4. Build or restore pages
        if (design?.pages && design.pages.length > 0 && design.pages.some((pg) => pg.elements?.length > 0)) {
          const enriched = design.pages.map((pg) => {
            const tPages =
              activeTpl?.pages && activeTpl.pages.length > 0
                ? activeTpl.pages
                : activeTpl?.published_snapshot?.pages || [];
            let tplPg = null;
            if (pg.page_type === "front_cover" || pg.page_id === "front-cover") {
              tplPg = tPages.find((p) => p.page_type === "front_cover");
            } else if (pg.page_type === "back_cover" || pg.page_id === "back-cover") {
              tplPg = tPages.find((p) => p.page_type === "back_cover");
            } else {
              tplPg = resolveTemplatePage(pg.page_number, pageCnt, activeTpl);
            }

            const enrichedElements = (pg.elements || []).map((el) => {
              if (el.type === "photo_frame") {
                const tplEl = tplPg?.elements?.find((te) => te.frame_id === el.frame_id || te.id === el.id);
                return {
                  ...el,
                  shape: el.shape || el.mask_shape || tplEl?.shape || "rectangle",
                  mask_shape: el.mask_shape || el.shape || tplEl?.mask_shape || "rectangle",
                  test_image_url: el.test_image_url || tplEl?.test_image_url || "",
                };
              }
              if (el.type === "decoration") {
                const dbDecDefs = extractDatabaseDecorations(activeTpl);
                const decMeta = resolveDbDecorationData(el, dbDecDefs);
                // Saved positions, dimensions, rotation, z_index must NOT be overridden by template defaults!
                return {
                  ...decMeta,
                  ...el,
                  svg: el.svg || decMeta?.svg || resolveDecorationSvg(el),
                  asset_url: el.asset_url || decMeta?.asset_url || "",
                };
              }
              return el;
            });

            return {
              ...pg,
              // Faithfully preserve saved user background
              background:
                pg.background && (pg.background.value || pg.background.type)
                  ? pg.background
                  : tplPg?.background || pg.background || { type: "color", value: "#ffffff", opacity: 1 },
              elements: (enrichedElements.length > 0 ? enrichedElements : (pg.elements || [])).map(normalizeElementToPaperCoords),
            };
          });

          // Preserve exact saved pages and layout sequence
          setPagesData(enriched);

          // Step resolution:
          // If customer explicitly clicked "Start New Book", start at Step 1 (Your Book)
          // If customer clicked "Continue My Book" (resume=true or step=3), open directly in Step 3 (Edit Your Book)
          if (isExplicitNew || stepParam === "1") {
            setCurrentStep(1);
            setMaxUnlockedStep(1);
          } else if (isExplicitResume) {
            setMaxUnlockedStep(3);
            setCurrentStep(3);
          } else if (enriched.some((pg) => pg.elements?.some((el) => el.type === "photo_frame" && el.photo_url))) {
            setMaxUnlockedStep(3);
            setCurrentStep(3);
          } else if (loadedPhotos.length > 0) {
            setMaxUnlockedStep(2);
            setCurrentStep(2);
          } else {
            setCurrentStep(1);
            setMaxUnlockedStep(1);
          }
        } else {
          const initialPages = buildPagesFromTemplate(pageCnt, activeTpl, loadedPhotos);
          setPagesData(initialPages);

          if (isExplicitNew || stepParam === "1") {
            setCurrentStep(1);
            setMaxUnlockedStep(1);
          } else if (isExplicitResume) {
            setMaxUnlockedStep(3);
            setCurrentStep(3);
          } else if (loadedPhotos.length > 0) {
            setMaxUnlockedStep(2);
            setCurrentStep(2);
          } else {
            setCurrentStep(1);
            setMaxUnlockedStep(1);
          }
        }

        // 5. Fetch Product Info
        const productIdToFetch = design?.product_id || product_name;
        if (productIdToFetch) {
          try {
            const prodRes = await axios.get(`${BASE_URL}/product/get_product/${productIdToFetch}`);
            const fetchedProd = prodRes?.data?.data?.[0] || prodRes?.data?.data || prodRes?.data;
            if (!isCancelled && fetchedProd) {
              setProductData(fetchedProd);
            }
          } catch (e) {
            console.warn("Product details error:", e);
          }
        }

        setDesignData(design);
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error("Failed to load photobook studio:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadStudio();
    return () => {
      isCancelled = true;
    };
  }, [current_working_id, product_name, buildPagesFromTemplate]);

  // ── Layout Presets Engine (1 to 4 Images) ──────────────────────────────────
  const getLayoutPresetsForCount = useCallback((count) => {
    if (count === 1) {
      return [
        { id: "full_picture", label: "Full picture", subtitle: "photo edge to edge" },
        { id: "polaroid", label: "Polaroid", subtitle: "classic card" },
        { id: "framed_square", label: "Framed", subtitle: "centered frame" },
        { id: "top_half", label: "Hero - top", subtitle: "photo top / text below" },
        { id: "theme", label: "Theme", subtitle: "the design's own" },
      ];
    }
    if (count === 2) {
      return [
        { id: "grid_below", label: "Grid - below", subtitle: "side by side photos" },
        { id: "full_picture", label: "Full picture", subtitle: "split edge to edge" },
        { id: "feature_on_photo", label: "Feature - on photo", subtitle: "text over photo" },
        { id: "hero_split", label: "Hero - split", subtitle: "stacked top / bottom" },
        { id: "theme", label: "Theme", subtitle: "the design's own" },
      ];
    }
    if (count === 3) {
      return [
        { id: "columns", label: "Trio columns", subtitle: "3 vertical strips" },
        { id: "hero_below", label: "Top 2, Bottom 1", subtitle: "wide hero below" },
        { id: "hero_top", label: "Hero - top", subtitle: "hero top / 2 bottom" },
        { id: "collage", label: "Collage", subtitle: "staggered trio" },
        { id: "theme", label: "Theme", subtitle: "the design's own" },
      ];
    }
    return [
      { id: "mosaic", label: "Mosaic", subtitle: "creative 2x2 grid" },
      { id: "hero_strip", label: "Hero + 3", subtitle: "1 large, 3 strip" },
      { id: "columns", label: "4 Columns", subtitle: "4 vertical strips" },
      { id: "panoramic_bottom", label: "Top 3 + Bottom 1", subtitle: "panoramic bottom" },
      { id: "theme", label: "Theme", subtitle: "the design's own" },
    ];
  }, []);

  const applyLayoutPreset = useCallback((count, presetId, frames = []) => {
    const cloned = frames.map((f) => ({ ...f }));
    // If 'theme', preserve template's original geometry, layout coordinates, and shapes (e.g. circle)
    if (presetId === "theme") {
      return cloned;
    }
    // For non-admin layouts, all placeholders must be neat, simple rectangle shapes
    for (let i = 0; i < cloned.length; i++) {
      cloned[i] = {
        ...cloned[i],
        shape: "rectangle",
        mask_shape: "rectangle",
      };
    }
    if (count === 1) {
      if (presetId === "full_picture") {
        cloned[0] = { ...cloned[0], x: 0, y: 0, width: 1000, height: 1000, x_pct: 0, y_pct: 0, width_pct: 100, height_pct: 100, unit: "%", is_percentage: true, border: { width: 0, radius: 0 } };
      } else if (presetId === "polaroid") {
        cloned[0] = { ...cloned[0], x: 120, y: 80, width: 760, height: 720, x_pct: 12, y_pct: 8, width_pct: 76, height_pct: 72, unit: "%", is_percentage: true, border: { width: 16, color: "#ffffff", radius: 4 } };
      } else if (presetId === "top_half") {
        cloned[0] = { ...cloned[0], x: 80, y: 60, width: 840, height: 600, x_pct: 8, y_pct: 6, width_pct: 84, height_pct: 60, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else if (presetId === "framed_square") {
        cloned[0] = { ...cloned[0], x: 150, y: 150, width: 700, height: 700, x_pct: 15, y_pct: 15, width_pct: 70, height_pct: 70, unit: "%", is_percentage: true, border: { width: 8, color: "#ffffff", radius: 8 } };
      } else {
        cloned[0] = { ...cloned[0], x: 0, y: 0, width: 1000, height: 1000, x_pct: 0, y_pct: 0, width_pct: 100, height_pct: 100, unit: "%", is_percentage: true, border: { width: 0, radius: 0 } };
      }
    } else if (count === 2) {
      if (presetId === "grid_below") {
        cloned[0] = { ...cloned[0], x: 60, y: 80, width: 420, height: 840, x_pct: 6, y_pct: 8, width_pct: 42, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 520, y: 80, width: 420, height: 840, x_pct: 52, y_pct: 8, width_pct: 42, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else if (presetId === "full_picture") {
        cloned[0] = { ...cloned[0], x: 0, y: 0, width: 498, height: 1000, x_pct: 0, y_pct: 0, width_pct: 49.8, height_pct: 100, unit: "%", is_percentage: true, border: { width: 0, radius: 0 } };
        cloned[1] = { ...cloned[1], x: 502, y: 0, width: 498, height: 1000, x_pct: 50.2, y_pct: 0, width_pct: 49.8, height_pct: 100, unit: "%", is_percentage: true, border: { width: 0, radius: 0 } };
      } else if (presetId === "feature_on_photo") {
        cloned[0] = { ...cloned[0], x: 40, y: 60, width: 560, height: 880, x_pct: 4, y_pct: 6, width_pct: 56, height_pct: 88, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 630, y: 180, width: 330, height: 640, x_pct: 63, y_pct: 18, width_pct: 33, height_pct: 64, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else if (presetId === "hero_split") {
        cloned[0] = { ...cloned[0], x: 80, y: 60, width: 840, height: 410, x_pct: 8, y_pct: 6, width_pct: 84, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 80, y: 510, width: 840, height: 410, x_pct: 8, y_pct: 51, width_pct: 84, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else {
        cloned[0] = { ...cloned[0], x: 60, y: 80, width: 420, height: 840, x_pct: 6, y_pct: 8, width_pct: 42, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 520, y: 80, width: 420, height: 840, x_pct: 52, y_pct: 8, width_pct: 42, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      }
    } else if (count === 3) {
      if (presetId === "columns") {
        cloned[0] = { ...cloned[0], x: 40, y: 80, width: 280, height: 840, x_pct: 4, y_pct: 8, width_pct: 28, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 360, y: 80, width: 280, height: 840, x_pct: 36, y_pct: 8, width_pct: 28, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 680, y: 80, width: 280, height: 840, x_pct: 68, y_pct: 8, width_pct: 28, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else if (presetId === "hero_below") {
        cloned[0] = { ...cloned[0], x: 50, y: 80, width: 430, height: 440, x_pct: 5, y_pct: 8, width_pct: 43, height_pct: 44, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 520, y: 80, width: 430, height: 440, x_pct: 52, y_pct: 8, width_pct: 43, height_pct: 44, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 50, y: 550, width: 900, height: 380, x_pct: 5, y_pct: 55, width_pct: 90, height_pct: 38, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else if (presetId === "hero_top") {
        cloned[0] = { ...cloned[0], x: 50, y: 80, width: 900, height: 440, x_pct: 5, y_pct: 8, width_pct: 90, height_pct: 44, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 50, y: 550, width: 430, height: 380, x_pct: 5, y_pct: 55, width_pct: 43, height_pct: 38, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 520, y: 550, width: 430, height: 380, x_pct: 52, y_pct: 55, width_pct: 43, height_pct: 38, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else {
        cloned[0] = { ...cloned[0], x: 40, y: 80, width: 280, height: 840, x_pct: 4, y_pct: 8, width_pct: 28, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 360, y: 80, width: 280, height: 840, x_pct: 36, y_pct: 8, width_pct: 28, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 680, y: 80, width: 280, height: 840, x_pct: 68, y_pct: 8, width_pct: 28, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      }
    } else if (count >= 4) {
      if (presetId === "mosaic") {
        cloned[0] = { ...cloned[0], x: 60, y: 60, width: 410, height: 410, x_pct: 6, y_pct: 6, width_pct: 41, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 530, y: 60, width: 410, height: 410, x_pct: 53, y_pct: 6, width_pct: 41, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 60, y: 530, width: 410, height: 410, x_pct: 6, y_pct: 53, width_pct: 41, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[3] = { ...cloned[3], x: 530, y: 530, width: 410, height: 410, x_pct: 53, y_pct: 53, width_pct: 41, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else if (presetId === "hero_strip") {
        cloned[0] = { ...cloned[0], x: 50, y: 60, width: 560, height: 880, x_pct: 5, y_pct: 6, width_pct: 56, height_pct: 88, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 640, y: 60, width: 310, height: 270, x_pct: 64, y_pct: 6, width_pct: 31, height_pct: 27, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 640, y: 360, width: 310, height: 270, x_pct: 64, y_pct: 36, width_pct: 31, height_pct: 27, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[3] = { ...cloned[3], x: 640, y: 660, width: 310, height: 280, x_pct: 64, y_pct: 66, width_pct: 31, height_pct: 28, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else if (presetId === "columns") {
        cloned[0] = { ...cloned[0], x: 40, y: 80, width: 205, height: 840, x_pct: 4, y_pct: 8, width_pct: 20.5, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 275, y: 80, width: 205, height: 840, x_pct: 27.5, y_pct: 8, width_pct: 20.5, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 510, y: 80, width: 205, height: 840, x_pct: 51, y_pct: 8, width_pct: 20.5, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[3] = { ...cloned[3], x: 745, y: 80, width: 205, height: 840, x_pct: 74.5, y_pct: 8, width_pct: 20.5, height_pct: 84, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else if (presetId === "panoramic_bottom") {
        cloned[0] = { ...cloned[0], x: 50, y: 80, width: 280, height: 380, x_pct: 5, y_pct: 8, width_pct: 28, height_pct: 38, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 360, y: 80, width: 280, height: 380, x_pct: 36, y_pct: 8, width_pct: 28, height_pct: 38, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 670, y: 80, width: 280, height: 380, x_pct: 67, y_pct: 8, width_pct: 28, height_pct: 38, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[3] = { ...cloned[3], x: 50, y: 490, width: 900, height: 430, x_pct: 5, y_pct: 49, width_pct: 90, height_pct: 43, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      } else {
        cloned[0] = { ...cloned[0], x: 60, y: 60, width: 410, height: 410, x_pct: 6, y_pct: 6, width_pct: 41, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[1] = { ...cloned[1], x: 530, y: 60, width: 410, height: 410, x_pct: 53, y_pct: 6, width_pct: 41, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[2] = { ...cloned[2], x: 60, y: 530, width: 410, height: 410, x_pct: 6, y_pct: 53, width_pct: 41, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
        cloned[3] = { ...cloned[3], x: 530, y: 530, width: 410, height: 410, x_pct: 53, y_pct: 53, width_pct: 41, height_pct: 41, unit: "%", is_percentage: true, border: { width: 0, radius: 6 } };
      }
    }
    return cloned;
  }, []);

  // ── Auto-Place Photos into Template (Supports Density Mode) ────────────────
  const syncPhotosToPages = useCallback(
    (photos, mode = photosPerPageMode) => {
      setPagesData((prev) => {
        let photoIdx = 0;
        return prev.map((page, pIdx) => {
          if (page.is_blank) return page;

          // Keep covers intact with their existing photo frame design
          if (page.page_type === "front_cover" || page.page_type === "back_cover") {
            const updatedElements = (page.elements || []).map((el) => {
              if (el.type === "photo_frame") {
                const photo = photos[photoIdx] || null;
                if (photo) photoIdx++;
                return {
                  ...el,
                  photo_url: photo ? photo.url : "",
                  photo_id: photo ? photo.id : "",
                };
              }
              return el;
            });
            return { ...page, elements: updatedElements };
          }

          // Case A: Mode is "template" or "admin_theme" -> Photos fit directly on the admin placeholders!
          if (mode === "template" || mode === "admin_theme") {
            const activeTpl = templateData || DEFAULT_VINTAGE_TEMPLATE;
            const tplPage = resolveTemplatePage(page.page_number, photoBookPages, activeTpl);
            const templateFrames = (tplPage?.elements || []).filter((el) => el.type === "photo_frame");
            const otherElements = (tplPage?.elements || []).filter((el) => el.type !== "photo_frame");

            // Assign photos to admin-created placeholder frames
            const populatedFrames = templateFrames.map((f) => {
              const photo = photos[photoIdx] || null;
              if (photo) photoIdx++;
              return {
                ...f,
                photo_url: photo ? photo.url : "",
                photo_id: photo ? photo.id : "",
              };
            });

            return {
              ...page,
              layout_id: "theme",
              background: tplPage?.background || page.background,
              elements: [...otherElements, ...populatedFrames],
            };
          }

          // Case B: User selected custom photo count ("1", "2", "3", "4", "mixed")
          let targetFrameCount = 1;
          let defaultPreset = "full_picture";

          if (mode === "1") {
            targetFrameCount = 1;
            defaultPreset = "full_picture";
          } else if (mode === "2") {
            targetFrameCount = 2;
            defaultPreset = "grid_below";
          } else if (mode === "3") {
            targetFrameCount = 3;
            defaultPreset = "columns";
          } else if (mode === "4") {
            targetFrameCount = 4;
            defaultPreset = "mosaic";
          } else if (mode === "mixed") {
            const pattern = [1, 2, 3, 2, 4, 1, 3];
            targetFrameCount = pattern[pIdx % pattern.length];
            if (targetFrameCount === 1) defaultPreset = "full_picture";
            else if (targetFrameCount === 2) defaultPreset = "grid_below";
            else if (targetFrameCount === 3) defaultPreset = "columns";
            else defaultPreset = "mosaic";
          }

          const existingFrames = (page.elements || []).filter((el) => el.type === "photo_frame");
          const otherElements = (page.elements || []).filter((el) => el.type !== "photo_frame");

          let adjustedFrames = [...existingFrames];
          if (adjustedFrames.length < targetFrameCount) {
            while (adjustedFrames.length < targetFrameCount) {
              const newIdx = adjustedFrames.length;
              adjustedFrames.push({
                id: `frame_${page.page_id || page.page_number}_${newIdx + 1}_${Date.now()}`,
                frame_id: `frame_${page.page_id || page.page_number}_${newIdx + 1}`,
                type: "photo_frame",
                photo_url: "",
                photo_id: "",
                x: 100,
                y: 100,
                width: 400,
                height: 400,
                border: { width: 0, color: "#000000", radius: 8 },
              });
            }
          } else if (adjustedFrames.length > targetFrameCount) {
            adjustedFrames = adjustedFrames.slice(0, targetFrameCount);
          }

          // By default the first layout for this count is applied
          adjustedFrames = applyLayoutPreset(adjustedFrames.length, defaultPreset, adjustedFrames);

          // Assign photos sequentially
          adjustedFrames = adjustedFrames.map((f) => {
            const photo = photos[photoIdx] || null;
            if (photo) photoIdx++;
            return {
              ...f,
              photo_url: photo ? photo.url : "",
              photo_id: photo ? photo.id : "",
            };
          });

          return {
            ...page,
            layout_id: defaultPreset,
            elements: [...otherElements, ...adjustedFrames],
          };
        });
      });
    },
    [photosPerPageMode, applyLayoutPreset, templateData, resolveTemplatePage, photoBookPages]
  );


  // ── Available Editions Resolver (From Real Template / Product Config) ───
  const availableEditions = useMemo(() => {
    const photobookConfig = productData?.photobook_config || {};
    const productTemplates = photobookConfig.templates || [];
    const candidateIds = [
      selectedTemplateId,
      selectedTemplateName,
      templateData?.template_id,
      templateData?.template_name,
      templateData?._id,
      templateData?.slug,
      designData?.template_id,
      designData?.template_name,
    ]
      .filter(Boolean)
      .map((x) => String(x).trim().toLowerCase());

    const matchedProductTemplate =
      productTemplates.find((t) => {
        const tid = String(t._id || "").trim().toLowerCase();
        const tslug = String(t.slug || "").trim().toLowerCase();
        const ttplid = String(t.template_id || "").trim().toLowerCase();
        const tname = String(t.template_name || "").trim().toLowerCase();
        return candidateIds.some(
          (cid) => cid === tid || cid === tslug || cid === ttplid || cid === tname
        );
      }) ||
      productTemplates[0] ||
      null;

    const realEditions =
      (matchedProductTemplate?.editions && matchedProductTemplate.editions.length > 0
        ? matchedProductTemplate.editions
        : null) ||
      (templateData?.editions && templateData.editions.length > 0
        ? templateData.editions
        : null) ||
      (photobookConfig.editions && photobookConfig.editions.length > 0
        ? photobookConfig.editions
        : null) ||
      [];

    if (Array.isArray(realEditions) && realEditions.length > 0) {
      return realEditions;
    }
    return [];
  }, [productData, templateData, designData, selectedTemplateName, selectedTemplateId]);

  // Reconcile selectedVariant when availableEditions are loaded
  useEffect(() => {
    if (availableEditions.length > 0) {
      const cur = String(selectedVariant || "").trim().toLowerCase();
      const matched = availableEditions.find(
        (e) =>
          (e.edition_name && String(e.edition_name).trim().toLowerCase() === cur) ||
          (e.name && String(e.name).trim().toLowerCase() === cur)
      );
      if (!matched) {
        setSelectedVariant(availableEditions[0]?.edition_name || availableEditions[0]?.name);
      }
    }
  }, [availableEditions]);

  // ── Autofill Empty Photo Slots ─────────────────────────────────────────────
  const handleAutofillEmptySlots = useCallback(() => {
    const placedUrls = new Set();
    pagesData.forEach((pg) => {
      (pg.elements || []).forEach((el) => {
        if (el.type === "photo_frame" && el.photo_url) {
          placedUrls.add(el.photo_url);
        }
      });
    });

    const unused = uploadedPhotos.filter((p) => !placedUrls.has(p.url));
    if (unused.length === 0) {
      message.info("All uploaded photos have already been placed in your book.");
      return;
    }

    let unusedIdx = 0;
    let filledCount = 0;

    const newPages = pagesData.map((pg) => {
      let pgUpdated = false;
      const newElements = (pg.elements || []).map((el) => {
        if (el.type === "photo_frame" && !el.photo_url && unusedIdx < unused.length) {
          const photoToPlace = unused[unusedIdx++];
          pgUpdated = true;
          filledCount++;
          return {
            ...el,
            photo_url: photoToPlace.url,
            photo_id: photoToPlace.id,
            photo_name: photoToPlace.name,
            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
          };
        }
        return el;
      });
      return pgUpdated ? { ...pg, elements: newElements } : pg;
    });

    if (filledCount > 0) {
      setPagesData(newPages);
      setHasUnsavedChanges(true);
      message.success(`Autofilled ${filledCount} empty photo slots!`);
    } else {
      message.info("No empty photo slots available to fill.");
    }
  }, [pagesData, uploadedPhotos]);

  // ── Auto-Save to Backend ───────────────────────────────────────────────────
  const saveDesignToBackend = useCallback(async (isManual = false) => {
    if (!current_working_id) return;
    try {
      setIsSaving(true);
      setSaveStatusText("Saving...");
      const guestId = localStorage.getItem("guestId") || "";

      const coverImg =
        pagesData[0]?.elements?.find((el) => el.type === "photo_frame" && el.photo_url)?.photo_url ||
        uploadedPhotos[0]?.url ||
        "";

      const normalizedPages = (pagesData || []).map((page, idx) => ({
        ...page,
        page_number: typeof page.page_number === "number" ? page.page_number : idx,
        display_label: page.display_label || (typeof page.page_number === "string" ? page.page_number : (idx === 0 ? "Front Cover" : `Page ${idx}`)),
        elements: (page.elements || []).map((el) => normalizeElementToPaperCoords(el)),
      }));

      const payload = {
        design_id: current_working_id,
        product_id: productData?._id || designData?.product_id || product_name,
        guest_id: guestId,
        size: activeSizeInfo.dimensions || activeSizeInfo.name || selectedSize,
        size_name: activeSizeInfo.dimensions || activeSizeInfo.name,
        size_id: selectedSize,
        variant: selectedVariant,
        cover_finish: selectedCoverFinish || designData?.cover_finish || "Matte",
        options: {
          selectedSize: activeSizeInfo.dimensions || activeSizeInfo.name || selectedSize,
          selectedSizeId: selectedSize,
          selectedVariant,
          selectedCoverFinish,
          selectedPaperType,
          includeGiftBox,
        },
        page_count: photoBookPages,
        target_photo_count: targetPhotoCount,
        photos_per_page_mode: photosPerPageMode,
        template_id: selectedTemplateId || templateData?.template_id || templateData?._id || designData?.template_id || "",
        template_name: selectedTemplateName || templateData?.template_name || designData?.template_name || "",
        uploaded_images: uploadedPhotos.map((p) => ({
          id: p.id,
          url: p.url,
          name: p.name || "",
          fileName: p.name || "",
          uploaded_at: p.uploaded_at || new Date(),
        })),
        pages: normalizedPages,
        cover_image: coverImg,
      };

      await savePhotoBookDesign(payload);
      setSaveStatusText("All changes saved ✓");
      setLastSavedTime(new Date());
      setHasUnsavedChanges(false);
      if (isManual) {
        message.success("Photo book design saved successfully!");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatusText("Save failed");
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to save design. Please check your network and try again.";
      if (isManual) {
        message.error(errMsg);
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    current_working_id,
    productData?._id,
    designData?.product_id,
    designData?.template_id,
    designData?.template_name,
    designData?.cover_finish,
    selectedSize,
    selectedVariant,
    selectedCoverFinish,
    selectedPaperType,
    includeGiftBox,
    selectedTemplateId,
    selectedTemplateName,
    templateData,
    photoBookPages,
    targetPhotoCount,
    photosPerPageMode,
    uploadedPhotos,
    pagesData,
    product_name,
  ]);

  // Debounced auto-save
  useEffect(() => {
    if (pagesData.length === 0 || isLoading) return;
    const timer = setTimeout(() => {
      saveDesignToBackend();
    }, 2500);
    return () => clearTimeout(timer);
  }, [pagesData, uploadedPhotos, saveDesignToBackend, isLoading]);

  // ── Page Completeness Calculations ─────────────────────────────────────────
  const pageStats = useMemo(() => {
    let completedCount = 0;
    let totalPhotosPlaced = 0;
    const emptyPages = [];

    pagesData.forEach((pg) => {
      const frames = (pg.elements || []).filter((el) => el.type === "photo_frame");
      const placedFrames = frames.filter((f) => Boolean(f.photo_url));
      totalPhotosPlaced += placedFrames.length;

      if (frames.length === 0 || placedFrames.length > 0) {
        completedCount++;
      } else {
        emptyPages.push(pg.page_number);
      }
    });

    return {
      completedCount,
      totalCount: pagesData.length,
      totalPhotosPlaced,
      isAllComplete: emptyPages.length === 0,
      emptyPages,
    };
  }, [pagesData]);

  // ── Step 1: Upload Images Handler ──────────────────────────────────────────
  const handleFilesSelected = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    // Filter duplicates against existing photos and within selected batch (name + size signature)
    const existingSignatures = new Set(
      uploadedPhotos.map((p) => {
        const name = (p.name || "").trim().toLowerCase();
        return p.size ? `${name}-${p.size}` : name;
      }).filter(Boolean)
    );
    const existingNames = new Set(
      uploadedPhotos.map((p) => (p.name || "").trim().toLowerCase()).filter(Boolean)
    );
    const seenBatchSignatures = new Set();
    const uniqueFiles = [];
    let duplicateCount = 0;

    for (const file of rawFiles) {
      const lowerName = (file.name || "").trim().toLowerCase();
      const sig = `${lowerName}-${file.size || 0}`;
      if (existingNames.has(lowerName) || existingSignatures.has(sig) || seenBatchSignatures.has(sig)) {
        duplicateCount++;
      } else {
        seenBatchSignatures.add(sig);
        uniqueFiles.push(file);
      }
    }

    if (e.target) e.target.value = "";
    if (sidebarPhotoInputRef.current) sidebarPhotoInputRef.current.value = "";

    if (duplicateCount > 0) {
      message.info(
        `${duplicateCount} duplicate photo${
          duplicateCount > 1 ? "s were" : " was"
        } skipped. Each photo must be unique.`
      );
    }

    if (uniqueFiles.length === 0) return;

    const availableSlots = maxImages - uploadedPhotos.length;
    if (availableSlots <= 0) {
      message.warning(`Maximum limit of ${maxImages} images already reached.`);
      return;
    }

    const filesToUpload = uniqueFiles.slice(0, availableSlots);
    setIsUploading(true);
    setUploadPercent(0);

    const newPhotoObjs = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      if (!file.type.startsWith("image/")) continue;

      const localUrl = URL.createObjectURL(file);
      const tempId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const photoObj = {
        id: tempId,
        url: localUrl,
        name: file.name,
        size: file.size,
      };
      newPhotoObjs.push(photoObj);

      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await axios.post(`${UPLOAD_BASE_URL}/upload_images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const serverUrl = _.get(res, "data.data.url", "");
        if (serverUrl) {
          photoObj.url = serverUrl;
        }
      } catch (err) {
        console.error("Upload error:", err);
      }

      setUploadPercent(Math.round(((i + 1) / filesToUpload.length) * 100));
    }

    const combined = [...uploadedPhotos, ...newPhotoObjs];
    setUploadedPhotos(combined);
    setIsUploading(false);
    setUploadPercent(100);
    if (fileInputRef.current) fileInputRef.current.value = "";
    message.success(`Added ${newPhotoObjs.length} unique photo(s)`);

    // Automatically assign photos to template pages!
    syncPhotosToPages(combined);
  };

  const handleDeletePhoto = (photoId) => {
    const updated = uploadedPhotos.filter((p) => p.id !== photoId);
    setUploadedPhotos(updated);
    syncPhotosToPages(updated);
  };

  // Set of photos currently used in pages
  const usedPhotoUrls = useMemo(() => {
    const urls = new Set();
    pagesData.forEach((pg) => {
      (pg.elements || []).forEach((el) => {
        if (el.type === "photo_frame" && el.photo_url) {
          urls.add(el.photo_url);
        }
      });
    });
    return urls;
  }, [pagesData]);

  // ── Filtered Uploaded Photos for Sidebar ─────────────────────────────────
  const filteredPhotos = useMemo(() => {
    if (photoFilter === "unused") {
      return uploadedPhotos.filter((p) => !usedPhotoUrls.has(p.url));
    }
    if (photoFilter === "placed") {
      return uploadedPhotos.filter((p) => usedPhotoUrls.has(p.url));
    }
    return uploadedPhotos;
  }, [uploadedPhotos, photoFilter, usedPhotoUrls]);

  const unusedPhotosCount = useMemo(() => {
    return Math.max(0, uploadedPhotos.length - usedPhotoUrls.size);
  }, [uploadedPhotos.length, usedPhotoUrls.size]);

  // Click to assign photo directly onto active modal frame or next open slot
  const handleAssignPhotoToPage = (photo) => {
    if (!photo || !photo.url) return;

    if (usedPhotoUrls.has(photo.url)) {
      message.warning("This photo is already placed in your photo book. Each photo is strictly unique.");
      return;
    }

    if (editingPageDraft) {
      const frames = (editingPageDraft.elements || []).filter((el) => el.type === "photo_frame");
      if (frames.length > 0) {
        let targetFrame = frames.find(
          (f) => f.id === selectedModalElementId || f.frame_id === selectedModalElementId
        );
        if (!targetFrame) {
          targetFrame = frames.find((f) => !f.photo_url) || frames[0];
        }
        const updatedElements = (editingPageDraft.elements || []).map((el) => {
          if (el.id === targetFrame.id || el.frame_id === targetFrame.frame_id) {
            return {
              ...el,
              photo_url: photo.url,
              photo_id: photo.id,
              test_image_url: photo.url,
            };
          }
          return el;
        });
        setEditingPageDraft({
          ...editingPageDraft,
          elements: updatedElements,
        });
        message.success("Placed photo onto active page");
        return;
      }
    }

    let placed = false;
    let placedPageTitle = "page";
    const newPages = pagesData.map((pg) => {
      if (placed || pg.is_blank) return pg;
      let framePlaced = false;
      const updatedEls = (pg.elements || []).map((el) => {
        if (!placed && !framePlaced && el.type === "photo_frame" && !el.photo_url) {
          placed = true;
          framePlaced = true;
          placedPageTitle = pg.display_label || (pg.page_number ? `Page ${pg.page_number}` : "Page");
          return {
            ...el,
            photo_url: photo.url,
            photo_id: photo.id,
            test_image_url: photo.url,
          };
        }
        return el;
      });
      return { ...pg, elements: updatedEls };
    });

    if (placed) {
      setPagesData(newPages);
      setHasUnsavedChanges(true);
      message.success(`Placed photo onto ${placedPageTitle}`);
    } else {
      message.info("All page frames currently have photos. Tap any page in the book to edit or swap photos.");
    }
  };

  // ── Step 1: Drag & Drop Re-Ordering of Uploaded Photos ─────────────────────
  const handlePhotoDragStart = (idx) => {
    setDraggedPhotoIndex(idx);
  };

  const handlePhotoDragOver = (e) => {
    e.preventDefault();
  };

  const handlePhotoDrop = (targetIdx) => {
    if (draggedPhotoIndex === null || draggedPhotoIndex === targetIdx) return;
    const reordered = [...uploadedPhotos];
    const [moved] = reordered.splice(draggedPhotoIndex, 1);
    reordered.splice(targetIdx, 0, moved);
    setUploadedPhotos(reordered);
    setDraggedPhotoIndex(null);

    // Re-sync newly ordered photos into template pages!
    syncPhotosToPages(reordered);
    message.info("Photo position updated & template re-flowed!");
  };

  // ── Undo / Redo Stack Management ──────────────────────────────────────────
  const pushToUndo = useCallback((currentPages) => {
    setUndoStack((prev) => [...prev.slice(-20), _.cloneDeep(currentPages)]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((r) => [_.cloneDeep(pagesData), ...r]);
    setUndoStack((u) => u.slice(0, -1));
    setPagesData(previous);
  }, [undoStack, pagesData]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack((u) => [...u, _.cloneDeep(pagesData)]);
    setRedoStack((r) => r.slice(1));
    setPagesData(next);
  }, [redoStack, pagesData]);

  // ── Step 3: Rearrange Interior Pages via Drag & Drop or Buttons ───────────
  const handleReorderInteriorPages = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    setPagesData((prevPages) => {
      const frontCover = prevPages.find(
        (p) => p.page_type === "front_cover" || p.page_id === "front-cover"
      );
      const backCover = prevPages.find(
        (p) => p.page_type === "back_cover" || p.page_id === "back-cover"
      );
      const blankInsideFront = prevPages.find(
        (p) => p.page_id === "blank-inside-front" || (p.is_blank && p.page_number === "Blank")
      );
      const blankInsideBack = prevPages.find((p) => p.page_id === "blank-inside-back");

      const interiorPages = prevPages.filter(
        (p) =>
          p.page_type !== "front_cover" &&
          p.page_id !== "front-cover" &&
          p.page_type !== "back_cover" &&
          p.page_id !== "back-cover" &&
          !p.is_blank &&
          p.page_id !== "blank-inside-front" &&
          p.page_id !== "blank-inside-back" &&
          p.page_type !== "blank"
      );

      if (fromIndex >= interiorPages.length || toIndex >= interiorPages.length) return prevPages;

      const reordered = [...interiorPages];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      const updatedInterior = reordered.map((pg, idx) => ({
        ...pg,
        page_number: idx + 1,
        display_label: `Page ${idx + 1}`,
      }));

      const newPages = [];
      if (frontCover) newPages.push(frontCover);
      if (blankInsideFront) newPages.push(blankInsideFront);
      newPages.push(...updatedInterior);
      if (blankInsideBack) newPages.push(blankInsideBack);
      if (backCover) newPages.push(backCover);

      pushToUndo(prevPages);
      return newPages;
    });

    message.success("Page order updated");
  }, [pushToUndo]);

  const handleMoveInteriorPage = useCallback((index, direction) => {
    handleReorderInteriorPages(index, index + direction);
  }, [handleReorderInteriorPages]);

  // ── Spread Calculation (Front & Back, Blank & Page 1, Page 2 & 3, ..., Page(n-1) & Blank) ───
  const spreads = useMemo(() => {
    if (!pagesData || pagesData.length === 0) return [];
    const list = [];

    const frontCover =
      pagesData.find((p) => p.page_type === "front_cover") ||
      pagesData.find((p) => p.page_id === "front-cover") ||
      pagesData[0];
    const backCover =
      pagesData.find((p) => p.page_type === "back_cover") ||
      pagesData.find((p) => p.page_id === "back-cover") ||
      pagesData[1];

    // Check if blank page is included in template and pagesData
    const isBlankPageEnabled = Boolean(
      templateData?.include_blank_page ||
      templateData?.page_config?.include_blank_page ||
      templateData?.published_snapshot?.include_blank_page ||
      templateData?.published_snapshot?.page_config?.include_blank_page
    );
    const hasBlankPage = isBlankPageEnabled && pagesData.some(
      (p) => p.is_blank || p.page_id === "blank-inside-front" || p.page_id === "blank-inside-back" || p.page_type === "blank"
    );

    // 1. Back and Front Cover spread (Back Cover on Left, Front Cover on Right)
    list.push({
      id: "spread-cover",
      spreadIndex: 0,
      title: "Covers (Back & Front)",
      leftPage: backCover,
      rightPage: frontCover,
    });

    // Interior pages: filter out front_cover, back_cover, and blank
    const interiorPages = pagesData
      .filter(
        (p) =>
          p.page_type !== "front_cover" &&
          p.page_type !== "back_cover" &&
          !p.is_blank &&
          p.page_id !== "blank-inside-front" &&
          p.page_id !== "blank-inside-back" &&
          p.page_type !== "blank"
      )
      .sort((a, b) => (Number(a.page_number) || 0) - (Number(b.page_number) || 0));

    if (hasBlankPage) {
      const blankInsideFront = pagesData.find((p) => p.page_id === "blank-inside-front") || {
        page_id: "blank-inside-front",
        name: "Blank Page",
        display_label: "Blank Page",
        page_type: "blank",
        page_number: "Blank",
        is_blank: true,
        background: { type: "color", value: "#ffffff" },
        elements: [],
      };

      const blankInsideBack = pagesData.find((p) => p.page_id === "blank-inside-back") || {
        page_id: "blank-inside-back",
        name: "Blank Page",
        display_label: "Blank Page",
        page_type: "blank",
        page_number: "Blank",
        is_blank: true,
        background: { type: "color", value: "#ffffff" },
        elements: [],
      };

      const page1 =
        interiorPages.find((p) => p.page_number === 1) ||
        interiorPages.find((p) => p.page_id === "page-1") ||
        interiorPages[0];

      // 2. Blank Page & Page 1
      list.push({
        id: "spread-blank-1",
        spreadIndex: 1,
        title: "Inside Cover & Page 1",
        leftPage: blankInsideFront,
        rightPage: page1,
      });

      // 3. Middle pages: Page 2 & 3, Page 4 & 5, ...
      const remainingPages = interiorPages.filter((p) => p.page_id !== page1?.page_id);
      let sIdx = 2;
      for (let i = 0; i < remainingPages.length; i += 2) {
        const leftP = remainingPages[i];
        const rightP = remainingPages[i + 1] || blankInsideBack;
        list.push({
          id: `spread-${leftP?.page_number}-${rightP?.page_number || "blank"}`,
          spreadIndex: sIdx,
          title: rightP?.is_blank
            ? `Page ${leftP?.page_number} & Blank Page`
            : `Pages ${leftP?.page_number} & ${rightP?.page_number}`,
          leftPage: leftP,
          rightPage: rightP,
        });
        sIdx++;
      }
    } else {
      // Direct interior pairing with NO blank page
      let sIdx = 1;
      for (let i = 0; i < interiorPages.length; i += 2) {
        const leftP = interiorPages[i];
        const rightP = interiorPages[i + 1] || null;
        list.push({
          id: `spread-${leftP?.page_number}-${rightP?.page_number || "end"}`,
          spreadIndex: sIdx,
          title: rightP
            ? `Pages ${leftP?.page_number} & ${rightP?.page_number}`
            : `Page ${leftP?.page_number}`,
          leftPage: leftP,
          rightPage: rightP,
        });
        sIdx++;
      }
    }

    return list;
  }, [pagesData, templateData]);

  // ── Photobook Preview Sequence ──
  const previewSteps = useMemo(() => {
    if (!pagesData || pagesData.length === 0) return [];
    const steps = [];

    const frontCover =
      pagesData.find((p) => p.page_type === "front_cover") ||
      pagesData.find((p) => p.page_id === "front-cover") ||
      pagesData[0];
    const backCover =
      pagesData.find((p) => p.page_type === "back_cover") ||
      pagesData.find((p) => p.page_id === "back-cover") ||
      pagesData[1];

    const isBlankPageEnabled = Boolean(
      templateData?.include_blank_page ||
      templateData?.page_config?.include_blank_page ||
      templateData?.published_snapshot?.include_blank_page ||
      templateData?.published_snapshot?.page_config?.include_blank_page
    );
    const hasBlankPage = isBlankPageEnabled && pagesData.some(
      (p) => p.is_blank || p.page_id === "blank-inside-front" || p.page_id === "blank-inside-back" || p.page_type === "blank"
    );

    // Step 0: Front Cover (Single Closed Book View)
    steps.push({
      type: "cover_front",
      stepIndex: 0,
      title: "Front Cover (Closed Book)",
      page: frontCover,
    });

    const interiorPages = pagesData
      .filter(
        (p) =>
          p.page_type !== "front_cover" &&
          p.page_type !== "back_cover" &&
          !p.is_blank &&
          p.page_id !== "blank-inside-front" &&
          p.page_id !== "blank-inside-back" &&
          p.page_type !== "blank"
      )
      .sort((a, b) => (Number(a.page_number) || 0) - (Number(b.page_number) || 0));

    let stepCount = 1;

    if (hasBlankPage) {
      const blankInsideFront = pagesData.find((p) => p.page_id === "blank-inside-front") || {
        page_id: "blank-inside-front",
        name: "Blank Page",
        display_label: "Blank Page",
        page_type: "blank",
        page_number: "Blank",
        is_blank: true,
        background: { type: "color", value: "#ffffff" },
        elements: [],
      };

      const blankInsideBack = pagesData.find((p) => p.page_id === "blank-inside-back") || {
        page_id: "blank-inside-back",
        name: "Blank Page",
        display_label: "Blank Page",
        page_type: "blank",
        page_number: "Blank",
        is_blank: true,
        background: { type: "color", value: "#ffffff" },
        elements: [],
      };

      const page1 =
        interiorPages.find((p) => p.page_number === 1) ||
        interiorPages.find((p) => p.page_id === "page-1") ||
        interiorPages[0];

      // Step 1: Inside Cover & Page 1 (Spread)
      steps.push({
        type: "spread",
        stepIndex: 1,
        title: "Inside Cover & Page 1",
        leftPage: blankInsideFront,
        rightPage: page1,
      });

      // Steps 2+: Page 2 & 3, Page 4 & 5, ...
      const remainingPages = interiorPages.filter((p) => p.page_id !== page1?.page_id);
      stepCount = 2;
      for (let i = 0; i < remainingPages.length; i += 2) {
        const leftP = remainingPages[i];
        const rightP = remainingPages[i + 1] || blankInsideBack;
        steps.push({
          type: "spread",
          stepIndex: stepCount,
          title: rightP?.is_blank
            ? `Page ${leftP?.page_number} & Inside Back Cover`
            : `Pages ${leftP?.page_number} & ${rightP?.page_number}`,
          leftPage: leftP,
          rightPage: rightP,
        });
        stepCount++;
      }
    } else {
      // Directly step through interior spreads without blank page
      stepCount = 1;
      for (let i = 0; i < interiorPages.length; i += 2) {
        const leftP = interiorPages[i];
        const rightP = interiorPages[i + 1] || null;
        steps.push({
          type: "spread",
          stepIndex: stepCount,
          title: rightP
            ? `Pages ${leftP?.page_number} & ${rightP?.page_number}`
            : `Page ${leftP?.page_number}`,
          leftPage: leftP,
          rightPage: rightP,
        });
        stepCount++;
      }
    }

    // Final Step: Back Cover (Single Closed Book View)
    steps.push({
      type: "cover_back",
      stepIndex: stepCount,
      title: "Back Cover (Closed Book)",
      page: backCover,
    });

    return steps;
  }, [pagesData, templateData]);

  const scrollToSpread = (index) => {
    if (index < 0 || index >= spreads.length) return;
    setCurrentSpreadIndex(index);
    const element = document.getElementById(spreads[index]?.id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const scrollToPrevSpread = () => {
    if (currentSpreadIndex > 0) {
      scrollToSpread(currentSpreadIndex - 1);
    }
  };

  const scrollToNextSpread = () => {
    if (currentSpreadIndex < spreads.length - 1) {
      scrollToSpread(currentSpreadIndex + 1);
    }
  };

  // ── Render Miniature SVG Wireframe for Layout Cards ───────────────────────
  const renderLayoutWireframe = (presetId, count, isSelected) => {
    const strokeColor = isSelected ? "#f59e0b" : "#94a3b8";
    const fillColor = isSelected ? "#fef3c7" : "#e2e8f0";

    if (presetId === "theme") {
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="2" y="2" width="32" height="24" rx="2" fill="none" stroke={strokeColor} strokeWidth="1" />
          <rect x="9" y="6" width="18" height="16" rx="1.5" fill={fillColor} />
          <circle cx="6" cy="6" r="1.5" fill="#f59e0b" />
        </svg>
      );
    }
    if (presetId === "full_picture") {
      if (count === 2) {
        return (
          <svg viewBox="0 0 36 28" className="w-full h-full">
            <rect x="2" y="2" width="15" height="24" rx="1" fill={fillColor} />
            <rect x="19" y="2" width="15" height="24" rx="1" fill={fillColor} />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="2" y="2" width="32" height="24" rx="1" fill={fillColor} />
        </svg>
      );
    }
    if (presetId === "grid_below") {
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="3" y="2" width="14" height="17" rx="1" fill={fillColor} />
          <rect x="19" y="14" width="14" height="17" rx="1" fill={fillColor} />
          <line x1="4" y1="23" x2="32" y2="23" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (presetId === "feature_on_photo") {
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="2" y="2" width="20" height="24" rx="1" fill={fillColor} />
          <rect x="24" y="6" width="10" height="18" rx="1" fill={fillColor} />
        </svg>
      );
    }
    if (presetId === "hero_split") {
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="2" y="2" width="32" height="11" rx="1" fill={fillColor} />
          <rect x="2" y="15" width="32" height="11" rx="1" fill={fillColor} />
        </svg>
      );
    }
    if (presetId === "columns") {
      if (count === 3) {
        return (
          <svg viewBox="0 0 36 28" className="w-full h-full">
            <rect x="2" y="2" width="9" height="24" rx="1" fill={fillColor} />
            <rect x="13.5" y="2" width="9" height="24" rx="1" fill={fillColor} />
            <rect x="25" y="2" width="9" height="24" rx="1" fill={fillColor} />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="2" y="2" width="6.5" height="24" rx="1" fill={fillColor} />
          <rect x="10.5" y="2" width="6.5" height="24" rx="1" fill={fillColor} />
          <rect x="19" y="2" width="6.5" height="24" rx="1" fill={fillColor} />
          <rect x="27.5" y="2" width="6.5" height="24" rx="1" fill={fillColor} />
        </svg>
      );
    }
    if (presetId === "hero_below") {
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="2" y="2" width="15" height="11" rx="1" fill={fillColor} />
          <rect x="19" y="2" width="15" height="11" rx="1" fill={fillColor} />
          <rect x="2" y="15" width="32" height="11" rx="1" fill={fillColor} />
        </svg>
      );
    }
    if (presetId === "hero_top") {
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="2" y="2" width="32" height="11" rx="1" fill={fillColor} />
          <rect x="2" y="15" width="15" height="11" rx="1" fill={fillColor} />
          <rect x="19" y="15" width="15" height="11" rx="1" fill={fillColor} />
        </svg>
      );
    }
    if (presetId === "hero_strip") {
      return (
        <svg viewBox="0 0 36 28" className="w-full h-full">
          <rect x="2" y="2" width="20" height="24" rx="1" fill={fillColor} />
          <rect x="24" y="2" width="10" height="6.5" rx="1" fill={fillColor} />
          <rect x="24" y="10.5" width="10" height="6.5" rx="1" fill={fillColor} />
          <rect x="24" y="19" width="10" height="7" rx="1" fill={fillColor} />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 36 28" className="w-full h-full">
        <rect x="2" y="2" width="15" height="11" rx="1" fill={fillColor} />
        <rect x="19" y="2" width="15" height="11" rx="1" fill={fillColor} />
        <rect x="2" y="15" width="15" height="11" rx="1" fill={fillColor} />
        <rect x="19" y="15" width="15" height="11" rx="1" fill={fillColor} />
      </svg>
    );
  };



  const handleSelectLayoutPreset = (presetId) => {
    if (!editingPageDraft) return;
    pushModalUndo();
    setSelectedLayoutId(presetId);
    setSelectedModalElementId(null);
    setActiveModalTransform(null);

    // If customer picks "theme", restore the admin template's original placeholders for this page
    if (presetId === "theme") {
      const activeTpl = templateData || DEFAULT_VINTAGE_TEMPLATE;
      const tplPage = resolveTemplatePage(editingPageDraft.page_number, photoBookPages, activeTpl);
      if (tplPage) {
        const existingPhotos = (editingPageDraft.elements || [])
          .filter((el) => el.type === "photo_frame" && el.photo_url)
          .map((el) => ({ url: el.photo_url, id: el.photo_id }));

        let pIdx = 0;
        const restoredElements = (tplPage.elements || []).map((el) => {
          if (el.type === "photo_frame") {
            const p = existingPhotos[pIdx] || null;
            if (p) pIdx++;
            return {
              ...el,
              photo_url: p ? p.url : "",
              photo_id: p ? p.id : "",
            };
          }
          if (el.type === "decoration") {
            const dbDecDefs = extractDatabaseDecorations(templateData);
            return resolveDbDecorationData(el, dbDecDefs);
          }
          return { ...el };
        });

        setEditingPageDraft({
          ...editingPageDraft,
          layout_id: "theme",
          background: tplPage.background || editingPageDraft.background,
          elements: restoredElements,
        });
        return;
      }
    }

    const frames = (editingPageDraft.elements || []).filter((el) => el.type === "photo_frame");
    const otherElements = (editingPageDraft.elements || []).filter((el) => el.type !== "photo_frame");
    const updatedFrames = applyLayoutPreset(frames.length, presetId, frames);
    setEditingPageDraft({
      ...editingPageDraft,
      layout_id: presetId,
      elements: [...updatedFrames, ...otherElements],
    });
  };

  const handleDividerDrag = (newRatio) => {
    const clamped = Math.min(75, Math.max(25, newRatio));
    setSplitRatio(clamped);
    if (!editingPageDraft) return;

    const frames = (editingPageDraft.elements || []).filter((el) => el.type === "photo_frame");
    if (frames.length !== 2 || frames.some((f) => f.shape === "circle")) return;

    const totalWidthPct = 88;
    const gapPct = 3;
    const w1Pct = +( (clamped / 100) * totalWidthPct - gapPct / 2 ).toFixed(2);
    const w2Pct = +( totalWidthPct - w1Pct - gapPct ).toFixed(2);
    const left1 = 6;
    const left2 = +(left1 + w1Pct + gapPct).toFixed(2);

    const updatedFrames = [
      {
        ...frames[0],
        x_pct: left1,
        width_pct: w1Pct,
        x_str: `${left1}%`,
        width_str: `${w1Pct}%`,
        unit: "%",
        is_percentage: true,
        x: Math.round(left1 * 10),
        width: Math.round(w1Pct * 10),
      },
      {
        ...frames[1],
        x_pct: left2,
        width_pct: w2Pct,
        x_str: `${left2}%`,
        width_str: `${w2Pct}%`,
        unit: "%",
        is_percentage: true,
        x: Math.round(left2 * 10),
        width: Math.round(w2Pct * 10),
      },
    ];
    const otherElements = (editingPageDraft.elements || []).filter((el) => el.type !== "photo_frame");

    setEditingPageDraft({
      ...editingPageDraft,
      elements: [...updatedFrames, ...otherElements],
    });
  };

  // ── Page Edit Modal Management ────────────────────────────────────────────
  const allEditablePages = useMemo(() => {
    if (!pagesData || pagesData.length === 0) return [];
    const backCover =
      pagesData.find((p) => p.page_type === "back_cover") ||
      pagesData.find((p) => p.page_id === "back-cover") ||
      pagesData[0];
    const frontCover =
      pagesData.find((p) => p.page_type === "front_cover") ||
      pagesData.find((p) => p.page_id === "front-cover") ||
      pagesData[1];
    const isBlankPageEnabled = Boolean(
      templateData?.include_blank_page ||
      templateData?.page_config?.include_blank_page ||
      templateData?.published_snapshot?.include_blank_page ||
      templateData?.published_snapshot?.page_config?.include_blank_page
    );
    const blankPage = isBlankPageEnabled
      ? pagesData.find((p) => p.is_blank || p.page_id === "blank-inside-front" || p.page_type === "blank") || null
      : null;
    const interiorPages = pagesData.filter(
      (p) =>
        p.page_type !== "front_cover" &&
        p.page_type !== "back_cover" &&
        !p.is_blank &&
        p.page_id !== "blank-inside-front" &&
        p.page_id !== "blank-inside-back" &&
        p.page_type !== "blank"
    );
    return [backCover, frontCover, blankPage, ...interiorPages].filter(Boolean);
  }, [pagesData, templateData]);

  const currentEditableIndex = useMemo(() => {
    if (!editingPageDraft) return 0;
    const idx = allEditablePages.findIndex((p) => p.page_id === editingPageDraft.page_id);
    return idx >= 0 ? idx : 0;
  }, [allEditablePages, editingPageDraft]);

  const sanitizePageDraft = (page) => {
    if (!page) return page;
    const cloned = _.cloneDeep(page);
    if (Array.isArray(cloned.elements)) {
      cloned.elements = cloned.elements.map((el) => {
        if (el.type === "text") {
          const dims = calculateDynamicTextDimensions({
            content: el.content,
            fontSize: el.font_size,
            fontFamily: el.font_family,
            fontWeight: el.font_weight,
            fontStyle: el.font_style,
            letterSpacing: el.letter_spacing,
            lineHeight: el.line_height,
            canvasWidth: 707,
            canvasHeight: 1000,
          });
          const width_pct = dims.width_pct;
          const height_pct = dims.height_pct;
          const w = Math.round((width_pct / 100) * 707);
          const h = Math.round((height_pct / 100) * 1000);
          let xPct = el.x_pct !== undefined ? el.x_pct : (el.x !== undefined ? (el.x > 1 ? el.x / 10 : el.x * 100) : 10);
          if ((el.align || "center") === "center") {
            const oldW = el.width_pct !== undefined ? el.width_pct : (el.width > 1 ? el.width / 10 : 80);
            const center = xPct + (oldW / 2);
            xPct = Math.max(0, Math.min(100 - width_pct, Number((center - (width_pct / 2)).toFixed(2))));
          } else if (el.align === "right") {
            const oldW = el.width_pct !== undefined ? el.width_pct : (el.width > 1 ? el.width / 10 : 80);
            const right = xPct + oldW;
            xPct = Math.max(0, Math.min(100 - width_pct, Number((right - width_pct).toFixed(2))));
          }
          let yPct = el.y_pct !== undefined ? el.y_pct : (el.y !== undefined ? (el.y > 1 ? el.y / 10 : el.y * 100) : 80);
          return {
            ...el,
            width_pct,
            height_pct,
            width_str: `${width_pct}%`,
            height_str: `${height_pct}%`,
            x_pct: xPct,
            y_pct: yPct,
            x_str: `${xPct}%`,
            y_str: `${yPct}%`,
            x: Math.round(xPct * 10),
            y: Math.round(yPct * 10),
            width: w,
            height: h,
            z_index: Math.max(100, Number(el.z_index) || 100),
          };
        }
        return el;
      });
    }
    return cloned;
  };

  const handleOpenPageEditModal = (page) => {
    if (!page) return;
    const sanitized = sanitizePageDraft(page);
    setEditingPageDraft(sanitized);
    setModalSubView("page");
    setIsAddMenuOpen(false);
    setSelectedModalElementId(null);
    setActiveModalTransform(null);
    setTextFormDraft({
      id: null,
      content: "",
      font_family: "Playfair Display",
      font_size: 28,
      color: "#1e293b",
      align: "center",
      x: 100,
      y: 820,
      width: 800,
      height: 60,
    });
    setModalUndoStack([]);
    setModalRedoStack([]);
    setSplitRatio(50);
    setSelectedLayoutId(sanitized.layout_id || "theme");
    setEditingModalOpen(true);
  };

  const handlePrevPageInModal = () => {
    if (currentEditableIndex > 0) {
      const target = allEditablePages[currentEditableIndex - 1];
      const sanitized = sanitizePageDraft(target);
      setEditingPageDraft(sanitized);
      setModalSubView("page");
      setIsAddMenuOpen(false);
      setSelectedModalElementId(null);
      setActiveModalTransform(null);
      setModalUndoStack([]);
      setModalRedoStack([]);
      setSplitRatio(50);
      setSelectedLayoutId(sanitized.layout_id || "theme");
    }
  };

  const handleNextPageInModal = () => {
    if (currentEditableIndex < allEditablePages.length - 1) {
      const target = allEditablePages[currentEditableIndex + 1];
      const sanitized = sanitizePageDraft(target);
      setEditingPageDraft(sanitized);
      setModalSubView("page");
      setIsAddMenuOpen(false);
      setSelectedModalElementId(null);
      setActiveModalTransform(null);
      setModalUndoStack([]);
      setModalRedoStack([]);
      setSplitRatio(50);
      setSelectedLayoutId(sanitized.layout_id || "theme");
    }
  };

  const pushModalUndo = () => {
    if (!editingPageDraft) return;
    setModalUndoStack((prev) => [...prev.slice(-15), _.cloneDeep(editingPageDraft)]);
    setModalRedoStack([]);
  };

  const handleModalUndo = () => {
    if (modalUndoStack.length === 0) return;
    const prev = modalUndoStack[modalUndoStack.length - 1];
    setModalRedoStack((r) => [_.cloneDeep(editingPageDraft), ...r]);
    setModalUndoStack((u) => u.slice(0, -1));
    setEditingPageDraft(prev);
  };

  const handleModalRedo = () => {
    if (modalRedoStack.length === 0) return;
    const next = modalRedoStack[0];
    setModalUndoStack((u) => [...u, _.cloneDeep(editingPageDraft)]);
    setModalRedoStack((r) => r.slice(1));
    setEditingPageDraft(next);
  };

  const handleReplacePhotoInDraft = (newPhoto) => {
    if (!editingPageDraft || !newPhoto?.url) return;
    pushModalUndo();
    const frames = (editingPageDraft.elements || []).filter((el) => el.type === "photo_frame");
    const otherElements = (editingPageDraft.elements || []).filter((el) => el.type !== "photo_frame");
    const targetFrame = targetPhotoIndexForChange !== null ? frames[targetPhotoIndexForChange] : null;

    if (!targetFrame) {
      // Adding a new photo to this page!
      const newFrame = {
        id: `frame_${editingPageDraft.page_id || editingPageDraft.page_number}_${frames.length + 1}_${Date.now()}`,
        frame_id: `frame_${editingPageDraft.page_id || editingPageDraft.page_number}_${frames.length + 1}`,
        type: "photo_frame",
        photo_url: newPhoto.url,
        photo_id: newPhoto.id || `photo-${Date.now()}`,
        test_image_url: newPhoto.url,
        x: 100,
        y: 100,
        width: 400,
        height: 400,
        border: { width: 0, color: "#000000", radius: 0 },
        shape: "rectangle",
        fit_mode: "cover",
        crop: { zoom: 1, offsetX: 0, offsetY: 0 },
        rotation: 0,
        z_index: 2,
      };

      const updatedFramesList = [...frames, newFrame];
      const newCount = updatedFramesList.length;

      // Determine default preset for this new count
      let defaultPreset = "full_picture";
      if (newCount === 2) defaultPreset = "grid_below";
      else if (newCount === 3) defaultPreset = "columns";
      else if (newCount >= 4) defaultPreset = "mosaic";

      // Apply the layout for the new photo count
      const laidOutFrames = applyLayoutPreset(newCount, defaultPreset, updatedFramesList);

      setSelectedLayoutId(defaultPreset);
      setEditingPageDraft({
        ...editingPageDraft,
        layout_id: defaultPreset,
        elements: [...laidOutFrames, ...otherElements],
      });
      setIsReplacePhotoModalOpen(false);
      setTargetPhotoIndexForChange(null);
      message.success(`Added photo! Layout updated for ${newCount} photos.`);
      return;
    }

    // Existing photo replacement
    const updatedElements = (editingPageDraft.elements || []).map((el) => {
      if (el.id === targetFrame.id || el.frame_id === targetFrame.frame_id) {
        return {
          ...el,
          shape: targetFrame.shape || el.shape || "rectangle",
          photo_url: newPhoto.url,
          photo_id: newPhoto.id || `photo-${Date.now()}`,
          test_image_url: newPhoto.url,
        };
      }
      return el;
    });

    setEditingPageDraft({ ...editingPageDraft, elements: updatedElements });
    setIsReplacePhotoModalOpen(false);
    setTargetPhotoIndexForChange(null);
    message.success("Photo replaced!");
  };

  const handleRemovePhotoFromDraft = (indexToRemove) => {
    if (!editingPageDraft) return;
    pushModalUndo();
    const frames = (editingPageDraft.elements || []).filter((el) => el.type === "photo_frame");

    if (frames.length <= 1) {
      const updated = (editingPageDraft.elements || []).map((el) => {
        if (el.type === "photo_frame") {
          return { ...el, photo_url: "", photo_id: "", test_image_url: "" };
        }
        return el;
      });
      setEditingPageDraft({ ...editingPageDraft, elements: updated });
      return;
    }

    const remainingFrames = frames.filter((_, idx) => idx !== indexToRemove);
    const otherElements = (editingPageDraft.elements || []).filter((el) => el.type !== "photo_frame");
    const newCount = remainingFrames.length;

    let defaultPreset = "full_picture";
    if (newCount === 2) defaultPreset = "grid_below";
    else if (newCount === 3) defaultPreset = "columns";
    else if (newCount >= 4) defaultPreset = "mosaic";

    const newLayoutElements = applyLayoutPreset(newCount, defaultPreset, remainingFrames);

    setSelectedLayoutId(defaultPreset);
    setEditingPageDraft({
      ...editingPageDraft,
      layout_id: defaultPreset,
      elements: [...newLayoutElements, ...otherElements],
    });
  };

  const handleAddPhotoToDraft = (photo) => {
    if (!editingPageDraft) return;
    const frames = (editingPageDraft.elements || []).filter((el) => el.type === "photo_frame");
    if (frames.length >= 4) {
      message.warning("A maximum of 4 photos can be added to this page.");
      return;
    }
    pushModalUndo();

    const newFrame = {
      id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      frame_id: `frame-${Date.now()}`,
      type: "photo_frame",
      photo_url: photo?.url || "",
      photo_id: photo?.id || "",
      test_image_url:
        photo?.url || "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      shape: "rectangle",
      fit_mode: "cover",
      border: { width: 0, color: "#ffffff", radius: 0 },
      crop: { zoom: 1, offsetX: 0, offsetY: 0 },
      rotation: 0,
      z_index: 2,
    };

    const updatedFrames = [...frames, newFrame];
    const otherElements = (editingPageDraft.elements || []).filter((el) => el.type !== "photo_frame");
    const newCount = updatedFrames.length;

    let defaultPreset = "full_picture";
    if (newCount === 2) defaultPreset = "grid_below";
    else if (newCount === 3) defaultPreset = "columns";
    else if (newCount >= 4) defaultPreset = "mosaic";

    const newLayoutElements = applyLayoutPreset(newCount, defaultPreset, updatedFrames);

    setSelectedLayoutId(defaultPreset);
    setEditingPageDraft({
      ...editingPageDraft,
      layout_id: defaultPreset,
      elements: [...newLayoutElements, ...otherElements],
    });
    setIsReplacePhotoModalOpen(false);
    message.success(`Added photo! Layout updated for ${newCount} photos.`);
  };

  // ── Page Text Editor Functions ────────────────────────────────────────────
  const handleOpenTextEditor = (existingText = null) => {
    setIsAddMenuOpen(false);
    if (existingText && !existingText.is_customer_editable) {
      message.info("This text is fixed by the template designer and cannot be customized.");
      return;
    }
    if (existingText) {
      const coords = getElementCoords(existingText);
      setTextFormDraft({
        id: existingText.id,
        content: existingText.content || "",
        font_family: existingText.font_family || "Playfair Display",
        font_size: existingText.font_size || 28,
        color: existingText.color || "#1e293b",
        align: existingText.align || "center",
        x_pct: coords.left,
        y_pct: coords.top,
        width_pct: coords.width,
        height_pct: coords.height,
        x: Math.round(coords.left * 10),
        y: Math.round(coords.top * 10),
        width: Math.round(coords.width * 10),
        height: Math.round(coords.height * 10),
      });
    } else {
      setTextFormDraft({
        id: null,
        content: "",
        font_family: "Playfair Display",
        font_size: 28,
        color: "#1e293b",
        align: "center",
        x_pct: 49.5,
        y_pct: 82,
        width_pct: 1.0,
        height_pct: 3.5,
        x: 495,
        y: 820,
        width: 10,
        height: 35,
      });
    }
    setModalSubView("text");
  };

  const handleSaveTextDraft = () => {
    if (!textFormDraft.content.trim()) {
      message.warning("Please enter some text or click Cancel.");
      return;
    }
    if (!editingPageDraft) return;
    pushModalUndo();

    const currentElements = editingPageDraft.elements || [];
    let updatedElements;
    const fontSize = Number(textFormDraft.font_size) || 28;
    const fontSizeRem = `${(fontSize / 16).toFixed(2)}rem`;
    const fontSizeCqmin = `${(fontSize / 10).toFixed(2)}cqmin`;

    if (textFormDraft.id) {
      // Update existing text element
      updatedElements = currentElements.map((el) => {
        if (el.id === textFormDraft.id) {
          const updatedDraft = {
            ...el,
            content: textFormDraft.content,
            font_family: textFormDraft.font_family,
            font_size: fontSize,
            align: textFormDraft.align,
          };
          const coords = getElementCoords(updatedDraft);
          return {
            ...el,
            content: textFormDraft.content,
            font_family: textFormDraft.font_family,
            font_size: fontSize,
            font_size_rem: fontSizeRem,
            font_size_cqmin: fontSizeCqmin,
            color: textFormDraft.color,
            align: textFormDraft.align,
            x_pct: coords.left,
            y_pct: coords.top,
            width_pct: coords.width,
            height_pct: coords.height,
            x_str: `${coords.left}%`,
            y_str: `${coords.top}%`,
            width_str: `${coords.width}%`,
            height_str: `${coords.height}%`,
            unit: "%",
            is_percentage: true,
            x: Math.round(coords.left * 10),
            y: Math.round(coords.top * 10),
            width: Math.round(coords.width * 10),
            height: Math.round(coords.height * 10),
            z_index: 100, // ALWAYS HIGH Z-INDEX (Above all images)
          };
        }
        return el;
      });
    } else {
      // Create new text element with responsive paper % coordinates
      const draftToMeasure = {
        type: "text",
        content: textFormDraft.content,
        font_family: textFormDraft.font_family || "Playfair Display",
        font_size: fontSize,
        align: textFormDraft.align || "center",
      };
      const coords = getElementCoords(draftToMeasure);
      const widthPct = coords.width;
      const heightPct = coords.height;
      const leftPct = (textFormDraft.align || "center") === "center"
        ? Number(((100 - widthPct) / 2).toFixed(2))
        : (textFormDraft.align === "right"
          ? Number((100 - widthPct - 5).toFixed(2))
          : (textFormDraft.x_pct !== undefined ? textFormDraft.x_pct : 10));
      const topPct = textFormDraft.y_pct !== undefined ? textFormDraft.y_pct : 82;

      const newTextEl = {
        id: `text_${Date.now()}`,
        type: "text",
        content: textFormDraft.content,
        font_family: textFormDraft.font_family || "Playfair Display",
        font_size: fontSize,
        font_size_rem: fontSizeRem,
        font_size_cqmin: fontSizeCqmin,
        color: textFormDraft.color || "#1e293b",
        align: textFormDraft.align || "center",
        x_pct: leftPct,
        y_pct: topPct,
        width_pct: widthPct,
        height_pct: heightPct,
        x_str: `${leftPct}%`,
        y_str: `${topPct}%`,
        width_str: `${widthPct}%`,
        height_str: `${heightPct}%`,
        unit: "%",
        is_percentage: true,
        x: Math.round(leftPct * 10),
        y: Math.round(topPct * 10),
        width: Math.round(widthPct * 10),
        height: Math.round(heightPct * 10),
        z_index: 100, // ALWAYS HIGH Z-INDEX (Above all images)
        is_customer_editable: true,
      };
      updatedElements = [...currentElements, newTextEl];
    }

    setEditingPageDraft({
      ...editingPageDraft,
      elements: updatedElements,
    });
    setModalSubView("page");
    message.success(textFormDraft.id ? "Text updated!" : "Text added to page!");
  };

  const handleCancelTextDraft = () => {
    setModalSubView("page");
  };

  const handleDeleteTextFromDraft = (textId) => {
    if (!editingPageDraft) return;
    pushModalUndo();
    setEditingPageDraft({
      ...editingPageDraft,
      elements: (editingPageDraft.elements || []).filter((el) => el.id !== textId),
    });
    message.success("Text removed!");
  };

  const handleStartDraftFrameResize = (e, frameId) => {
    e.preventDefault();
    e.stopPropagation();
    const container = canvasContainerRef.current;
    if (!container || !editingPageDraft) return;
    const rect = container.getBoundingClientRect();
    const frame = (editingPageDraft.elements || []).find((el) => el.id === frameId || el.frame_id === frameId);
    if (!frame) return;

    pushModalUndo();
    const startX = e.clientX;
    const startY = e.clientY;
    const coords = getElementCoords(frame);
    const startWPct = coords.width;
    const startHPct = coords.height;
    const is1to1Shape = ["circle", "heart", "star", "scallop", "hexagon"].includes(frame.shape);

    const onMouseMove = (moveEvent) => {
      const deltaXPct = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaYPct = ((moveEvent.clientY - startY) / rect.height) * 100;

      // Keep position coords.left, coords.top STRICTLY unchanged!
      const maxWPct = 100 - coords.left;
      const maxHPct = 100 - coords.top;
      let newWPct = +(Math.max(10, Math.min(maxWPct, startWPct + deltaXPct))).toFixed(2);
      let newHPct = +(Math.max(10, Math.min(maxHPct, startHPct + deltaYPct))).toFixed(2);

      if (is1to1Shape) {
        // Uniform 1:1 scale for circle, heart, star, scallop frames
        const uniformSizePct = +(Math.max(10, Math.min(maxWPct, maxHPct, startWPct + deltaXPct))).toFixed(2);
        newWPct = uniformSizePct;
        newHPct = uniformSizePct;
      }

      setEditingPageDraft((prev) => {
        if (!prev) return prev;
        const updated = (prev.elements || []).map((el) => {
          if (el.id === frameId || el.frame_id === frameId) {
            return {
              ...el,
              x_pct: coords.left,
              y_pct: coords.top,
              width_pct: newWPct,
              height_pct: newHPct,
              x_str: `${coords.left}%`,
              y_str: `${coords.top}%`,
              width_str: `${newWPct}%`,
              height_str: `${newHPct}%`,
              unit: "%",
              is_percentage: true,
              width: Math.round(newWPct * 10),
              height: Math.round(newHPct * 10),
            };
          }
          return el;
        });
        return { ...prev, elements: updated };
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleApplyPageDraft = () => {
    if (!editingPageDraft) return;
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((pg) => (pg.page_id === editingPageDraft.page_id ? editingPageDraft : pg))
    );
    setEditingModalOpen(false);
    message.success(`Saved changes to ${editingPageDraft.display_label || "page"}!`);
  };

  // ── Admin-Style Element Selection & Transformations in Modal Canvas ────────
  const isElementCustomerEditable = (element) => {
    if (!element) return false;
    if (element.type === "text") return Boolean(element.is_customer_editable);
    return element.is_customer_editable !== false;
  };

  const handleModalElementMouseDown = (e, element) => {
    e.stopPropagation();
    lastModalElementClickRef.current = Date.now();
    if (!isElementCustomerEditable(element)) return;

    setSelectedModalElementId(element.id || element.frame_id);
    if (element.is_locked) return;

    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const coords = getElementCoords(element);

    pushModalUndo();
    setActiveModalTransform({
      type: "move",
      elementId: element.id || element.frame_id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: coords.left,
      initialTop: coords.top,
      containerRect: rect,
      hasMoved: false,
    });
  };

  const handleModalResizeMouseDown = (e, handle, element) => {
    if (element.is_locked || !isElementCustomerEditable(element)) return;
    e.stopPropagation();
    e.preventDefault();

    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const coords = getElementCoords(element);
    const is1to1 = ["circle", "heart", "star", "scallop", "hexagon"].includes(element.shape);

    pushModalUndo();
    setActiveModalTransform({
      type: "resize",
      handle: handle.position,
      elementId: element.id || element.frame_id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: coords.left,
      initialTop: coords.top,
      initialWidth: coords.width,
      initialHeight: coords.height,
      rotation: element.rotation || 0,
      containerRect: rect,
      is1to1Shape: is1to1,
    });
  };

  const handleModalRotateMouseDown = (e, element) => {
    if (element.is_locked || !isElementCustomerEditable(element)) return;
    e.stopPropagation();
    e.preventDefault();

    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const coords = getElementCoords(element);

    const centerX = rect.left + ((coords.left + coords.width / 2) / 100) * rect.width;
    const centerY = rect.top + ((coords.top + coords.height / 2) / 100) * rect.height;

    pushModalUndo();
    setActiveModalTransform({
      type: "rotate",
      elementId: element.id || element.frame_id,
      centerX,
      centerY,
      initialRotation: element.rotation || 0,
    });
  };

  const handleModalMouseMove = useCallback((e) => {
    if (!activeModalTransform) return;

    if (activeModalTransform.type === "move") {
      const { startX, startY, initialLeft, initialTop, containerRect, elementId } = activeModalTransform;
      const deltaScreenX = e.clientX - startX;
      const deltaScreenY = e.clientY - startY;
      if (Math.abs(deltaScreenX) > 3 || Math.abs(deltaScreenY) > 3) {
        activeModalTransform.hasMoved = true;
      }
      const deltaXPct = (deltaScreenX / containerRect.width) * 100;
      const deltaYPct = (deltaScreenY / containerRect.height) * 100;

      const nextLeft = +(Math.max(-50, Math.min(150, initialLeft + deltaXPct))).toFixed(2);
      const nextTop = +(Math.max(-50, Math.min(150, initialTop + deltaYPct))).toFixed(2);

      setEditingPageDraft((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          elements: (prev.elements || []).map((el) => {
            if ((el.id || el.frame_id) === elementId) {
              return {
                ...el,
                x_pct: nextLeft,
                y_pct: nextTop,
                x_norm: +(nextLeft / 100).toFixed(6),
                y_norm: +(nextTop / 100).toFixed(6),
                x_str: `${nextLeft}%`,
                y_str: `${nextTop}%`,
                unit: "%",
                is_percentage: true,
                x: Math.round(nextLeft * 10),
                y: Math.round(nextTop * 10),
              };
            }
            return el;
          }),
        };
      });
    } else if (activeModalTransform.type === "resize") {
      const { startX, startY, initialLeft, initialTop, initialWidth, initialHeight, handle, containerRect, elementId, is1to1Shape, rotation } = activeModalTransform;
      
      const screenDX = e.clientX - startX;
      const screenDY = e.clientY - startY;

      // Project screen delta into element local axes if element is rotated
      let localDX = screenDX;
      let localDY = screenDY;
      if (rotation && rotation !== 0) {
        const rad = -(rotation * Math.PI) / 180;
        localDX = screenDX * Math.cos(rad) - screenDY * Math.sin(rad);
        localDY = screenDX * Math.sin(rad) + screenDY * Math.cos(rad);
      }

      const deltaXPct = (localDX / containerRect.width) * 100;
      const deltaYPct = (localDY / containerRect.height) * 100;

      let newLeft = initialLeft;
      let newTop = initialTop;
      let newW = initialWidth;
      let newH = initialHeight;

      if (handle.includes("e")) newW = Math.max(5, initialWidth + deltaXPct);
      if (handle.includes("s")) newH = Math.max(5, initialHeight + deltaYPct);
      if (handle.includes("w")) {
        const w = Math.max(5, initialWidth - deltaXPct);
        newLeft = initialLeft + (initialWidth - w);
        newW = w;
      }
      if (handle.includes("n")) {
        const h = Math.max(5, initialHeight - deltaYPct);
        newTop = initialTop + (initialHeight - h);
        newH = h;
      }

      if (is1to1Shape) {
        const uniformW = Math.max(5, Math.max(newW, newH));
        if (handle.includes("w")) newLeft = initialLeft + (initialWidth - uniformW);
        if (handle.includes("n")) newTop = initialTop + (initialHeight - uniformW);
        newW = uniformW;
        newH = uniformW;
      }

      newLeft = +(Math.max(-50, Math.min(150, newLeft))).toFixed(2);
      newTop = +(Math.max(-50, Math.min(150, newTop))).toFixed(2);
      newW = +(Math.max(5, Math.min(200, newW))).toFixed(2);
      newH = +(Math.max(5, Math.min(200, newH))).toFixed(2);

      setEditingPageDraft((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          elements: (prev.elements || []).map((el) => {
            if ((el.id || el.frame_id) === elementId) {
              return {
                ...el,
                x_pct: newLeft,
                y_pct: newTop,
                width_pct: newW,
                height_pct: newH,
                x_norm: +(newLeft / 100).toFixed(6),
                y_norm: +(newTop / 100).toFixed(6),
                w_norm: +(newW / 100).toFixed(6),
                h_norm: +(newH / 100).toFixed(6),
                x_str: `${newLeft}%`,
                y_str: `${newTop}%`,
                width_str: `${newW}%`,
                height_str: `${newH}%`,
                unit: "%",
                is_percentage: true,
                width: Math.round(newW * 10),
                height: Math.round(newH * 10),
              };
            }
            return el;
          }),
        };
      });
    } else if (activeModalTransform.type === "rotate") {
      const { centerX, centerY, elementId } = activeModalTransform;
      const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let deg = Math.round((rad * 180) / Math.PI + 90);
      if (deg < 0) deg += 360;
      deg = deg % 360;

      if (deg > 355 || deg < 5) deg = 0;
      if (Math.abs(deg - 90) < 5) deg = 90;
      if (Math.abs(deg - 180) < 5) deg = 180;
      if (Math.abs(deg - 270) < 5) deg = 270;

      setEditingPageDraft((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          elements: (prev.elements || []).map((el) => {
            if ((el.id || el.frame_id) === elementId) {
              return { ...el, rotation: deg };
            }
            return el;
          }),
        };
      });
    }
  }, [activeModalTransform]);

  const handleModalMouseUp = useCallback(() => {
    if (activeModalTransform) {
      setActiveModalTransform(null);
    }
  }, [activeModalTransform]);

  useEffect(() => {
    if (activeModalTransform) {
      window.addEventListener("mousemove", handleModalMouseMove);
      window.addEventListener("mouseup", handleModalMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleModalMouseMove);
        window.removeEventListener("mouseup", handleModalMouseUp);
      };
    }
  }, [activeModalTransform, handleModalMouseMove, handleModalMouseUp]);

  // ── In-Frame Image Fitting & Zoom Controls (Preserves Frame Geometry) ───────
  const handleUpdateModalFrameFit = (elementId, fitMode) => {
    pushModalUndo();
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: (prev.elements || []).map((el) => {
          if ((el.id || el.frame_id) === elementId) {
            return { ...el, fit_mode: fitMode };
          }
          return el;
        }),
      };
    });
  };

  const handleUpdateModalFrameZoom = (elementId, newZoom) => {
    const clamped = Math.max(0.5, Math.min(3.0, Number(newZoom) || 1));
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: (prev.elements || []).map((el) => {
          if ((el.id || el.frame_id) === elementId) {
            return {
              ...el,
              crop: {
                ...(el.crop || {}),
                zoom: +clamped.toFixed(2),
              },
            };
          }
          return el;
        }),
      };
    });
  };

  const handleUpdateModalFrameCropOffset = (elementId, offsetX, offsetY) => {
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: (prev.elements || []).map((el) => {
          if ((el.id || el.frame_id) === elementId) {
            return {
              ...el,
              crop: {
                ...(el.crop || {}),
                offsetX: offsetX !== undefined ? offsetX : (el.crop?.offsetX || 0),
                offsetY: offsetY !== undefined ? offsetY : (el.crop?.offsetY || 0),
              },
            };
          }
          return el;
        }),
      };
    });
  };

  const handleResetModalFrameZoom = (elementId) => {
    pushModalUndo();
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: (prev.elements || []).map((el) => {
          if ((el.id || el.frame_id) === elementId) {
            return {
              ...el,
              crop: {
                zoom: 1,
                offsetX: 0,
                offsetY: 0,
                rotation: 0,
              },
            };
          }
          return el;
        }),
      };
    });
  };

  const handleModalBringForward = (elementId) => {
    pushModalUndo();
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      const elements = [...(prev.elements || [])];
      const idx = elements.findIndex((el) => (el.id || el.frame_id) === elementId);
      if (idx === -1 || idx === elements.length - 1) return prev;
      const item = elements[idx];
      elements.splice(idx, 1);
      elements.splice(idx + 1, 0, item);
      const reindexed = elements.map((el, i) => ({ ...el, z_index: i + 1 }));
      return { ...prev, elements: reindexed };
    });
  };

  const handleModalSendBackward = (elementId) => {
    pushModalUndo();
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      const elements = [...(prev.elements || [])];
      const idx = elements.findIndex((el) => (el.id || el.frame_id) === elementId);
      if (idx <= 0) return prev;
      const item = elements[idx];
      elements.splice(idx, 1);
      elements.splice(idx - 1, 0, item);
      const reindexed = elements.map((el, i) => ({ ...el, z_index: i + 1 }));
      return { ...prev, elements: reindexed };
    });
  };

  const handleToggleModalFrameFlip = (elementId) => {
    pushModalUndo();
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: (prev.elements || []).map((el) => {
          if ((el.id || el.frame_id) === elementId) {
            const currentFlip = Boolean(el.crop?.flipH || el.flip_h);
            return {
              ...el,
              flip_h: !currentFlip,
              crop: {
                ...(el.crop || {}),
                flipH: !currentFlip,
              },
            };
          }
          return el;
        }),
      };
    });
    message.success("Image flipped horizontally!");
  };

  const handleModalRotateStep = (elementId, deltaDeg = 90) => {
    pushModalUndo();
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: (prev.elements || []).map((el) => {
          if ((el.id || el.frame_id) === elementId) {
            const nextRot = ((el.rotation || 0) + deltaDeg) % 360;
            return {
              ...el,
              rotation: nextRot,
            };
          }
          return el;
        }),
      };
    });
  };

  const handleDeleteModalFrame = (elementId) => {
    pushModalUndo();
    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      const updated = (prev.elements || []).filter((el) => (el.id || el.frame_id) !== elementId);
      return { ...prev, elements: updated };
    });
    if (selectedModalElementId === elementId) {
      setSelectedModalElementId(null);
    }
  };

  const startDividerDrag = (e) => {
    e.preventDefault();
    const container = canvasContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const onMouseMove = (moveEvent) => {
      const offsetX = moveEvent.clientX - rect.left;
      const ratio = Math.round((offsetX / rect.width) * 100);
      handleDividerDrag(ratio);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleModalFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    const tempPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: localUrl,
      name: file.name,
    };
    setUploadedPhotos((prev) => [...prev, tempPhoto]);
    if (targetPhotoSlot) {
      handleFrameDrop(targetPhotoSlot, tempPhoto);
      setTargetPhotoSlot(null);
      setIsReplacePhotoModalOpen(false);
    } else if (targetPhotoIndexForChange !== null) {
      handleReplacePhotoInDraft(tempPhoto);
    } else {
      handleAddPhotoToDraft(tempPhoto);
    }
    if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(`${UPLOAD_BASE_URL}/upload_images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const serverUrl = _.get(res, "data.data.url", "");
      if (serverUrl) {
        tempPhoto.url = serverUrl;
        setUploadedPhotos((prev) =>
          prev.map((p) => (p.id === tempPhoto.id ? { ...p, url: serverUrl } : p))
        );
      }
    } catch (err) {
      console.error("Modal file upload error:", err);
    }
  };

  // ── Canvas Element Manipulation (Across all spreads/pages) ────────────────
  const handleFrameDrop = (frameId, photo) => {
    if (!photo?.url) return;
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((page) => {
        const frameExists = page.elements?.some((el) => el.frame_id === frameId || el.id === frameId);
        if (!frameExists) return page;

        const updatedElements = page.elements.map((el) => {
          if (el.frame_id === frameId || el.id === frameId) {
            return {
              ...el,
              photo_url: photo.url,
              photo_id: photo.id,
              crop: { zoom: 1, offsetX: 0, offsetY: 0 },
              rotation: 0,
            };
          }
          return el;
        });

        return { ...page, elements: updatedElements };
      })
    );
    setDragOverFrameId(null);
    setSelectedFrameId(null);
    message.success("Photo placed into frame!");
  };

  const handleRemovePhotoFromFrame = (frameId, e) => {
    if (e) e.stopPropagation();
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((page) => {
        const frameExists = page.elements?.some((el) => el.frame_id === frameId || el.id === frameId);
        if (!frameExists) return page;

        const updatedElements = page.elements.map((el) => {
          if (el.frame_id === frameId || el.id === frameId) {
            return { ...el, photo_url: "", photo_id: "" };
          }
          return el;
        });

        return { ...page, elements: updatedElements };
      })
    );
  };

  const handleFrameZoom = (frameId, delta, e) => {
    if (e) e.stopPropagation();
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((page) => {
        const frameExists = page.elements?.some((el) => el.frame_id === frameId || el.id === frameId);
        if (!frameExists) return page;

        const updatedElements = page.elements.map((el) => {
          if (el.frame_id === frameId || el.id === frameId) {
            const nextZoom = Math.min(3, Math.max(1, (el.crop?.zoom || 1) + delta));
            return { ...el, crop: { ...(el.crop || {}), zoom: nextZoom } };
          }
          return el;
        });

        return { ...page, elements: updatedElements };
      })
    );
  };

  const handleFrameRotate = (frameId, e) => {
    if (e) e.stopPropagation();
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((page) => {
        const frameExists = page.elements?.some((el) => el.frame_id === frameId || el.id === frameId);
        if (!frameExists) return page;

        const updatedElements = page.elements.map((el) => {
          if (el.frame_id === frameId || el.id === frameId) {
            const nextRot = ((el.rotation || 0) + 90) % 360;
            return { ...el, rotation: nextRot };
          }
          return el;
        });

        return { ...page, elements: updatedElements };
      })
    );
  };

  const handleTextContentChange = (elementId, newText) => {
    const updateElementContent = (el) => {
      if (el.id === elementId) {
        const dims = calculateDynamicTextDimensions({
          content: newText,
          fontSize: el.font_size,
          fontFamily: el.font_family,
          fontWeight: el.font_weight,
          fontStyle: el.font_style,
          letterSpacing: el.letter_spacing,
          lineHeight: el.line_height,
          canvasWidth: 707,
          canvasHeight: 1000,
        });

        const oldW = el.width_pct !== undefined ? el.width_pct : 80;
        const newW = dims.width_pct;
        let newX = el.x_pct !== undefined ? el.x_pct : 10;

        if ((el.align || "center") === "center") {
          const center = newX + (oldW / 2);
          newX = Math.max(0, Math.min(100 - newW, Number((center - (newW / 2)).toFixed(2))));
        } else if (el.align === "right") {
          const right = newX + oldW;
          newX = Math.max(0, Math.min(100 - newW, Number((right - newW).toFixed(2))));
        }

        return {
          ...el,
          content: newText,
          width_pct: newW,
          height_pct: dims.height_pct,
          width_str: `${newW}%`,
          height_str: `${dims.height_pct}%`,
          x_pct: newX,
          x_str: `${newX}%`,
          width: Math.round(newW * 10),
          height: Math.round(dims.height_pct * 10),
          x: Math.round(newX * 10),
        };
      }
      return el;
    };

    setPagesData((prev) =>
      prev.map((page) => {
        const textExists = page.elements?.some((el) => el.id === elementId);
        if (!textExists) return page;
        return { ...page, elements: page.elements.map(updateElementContent) };
      })
    );

    setEditingPageDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: (prev.elements || []).map(updateElementContent),
      };
    });
  };

  const handleClearPagePhotos = (pageNumber) => {
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((pg) => {
        if (pg.page_number === pageNumber) {
          return {
            ...pg,
            elements: (pg.elements || []).map((el) => {
              if (el.type === "photo_frame") {
                return { ...el, photo_url: "", photo_id: "" };
              }
              return el;
            }),
          };
        }
        return pg;
      })
    );
    message.success(`Cleared photos on Page ${pageNumber}`);
  };

  const handleAutoFillPhotos = () => {
    if (uploadedPhotos.length === 0) {
      message.warning("Please upload some photos first!");
      setActiveTool("add");
      return;
    }
    pushToUndo(pagesData);
    let pIdx = 0;
    setPagesData((prev) =>
      prev.map((page) => {
        const updated = (page.elements || []).map((el) => {
          if (el.type === "photo_frame") {
            const photo = uploadedPhotos[pIdx % uploadedPhotos.length];
            pIdx++;
            return {
              ...el,
              photo_url: photo.url,
              photo_id: photo.id,
            };
          }
          return el;
        });
        return { ...page, elements: updated };
      })
    );
    message.success("Auto-filled photos into all template frames!");
  };

  // ── Element Manipulation Handlers (Move, Resize, Duplicate, Delete, Crop) ──
  const handleStartElementMove = (e, el, pageId) => {
    e.stopPropagation();
    setSelectedFrameId(el.frame_id || el.id);

    const container = e.currentTarget.closest(".page-canvas-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const coords = getElementCoords(el);

    setActiveCustomerTransform({
      type: "move",
      elementId: el.id || el.frame_id,
      pageId,
      startX: e.clientX,
      startY: e.clientY,
      initialLeftPct: coords.left,
      initialTopPct: coords.top,
      initialWPct: coords.width,
      initialHPct: coords.height,
      initialX: Math.round(coords.left * 10),
      initialY: Math.round(coords.top * 10),
      initialW: Math.round(coords.width * 10),
      initialH: Math.round(coords.height * 10),
      containerWidth: rect.width,
      containerHeight: rect.height,
    });
  };

  const handleDraftFrameResize = (frameId, deltaW, deltaH = 0) => {
    if (!editingPageDraft) return;
    pushModalUndo();
    setEditingPageDraft((prev) => ({
      ...prev,
      elements: (prev.elements || []).map((el) => {
        if (el.id === frameId || el.frame_id === frameId) {
          const coords = getElementCoords(el);
          const newWPct = Math.max(10, Math.min(100 - coords.left, +(coords.width + deltaW * 0.1).toFixed(2)));
          const newHPct = deltaH ? Math.max(10, Math.min(100 - coords.top, +(coords.height + deltaH * 0.1).toFixed(2))) : coords.height;
          return {
            ...el,
            width_pct: newWPct,
            height_pct: newHPct,
            width_str: `${newWPct}%`,
            height_str: `${newHPct}%`,
            unit: "%",
            is_percentage: true,
            width: Math.round(newWPct * 10),
            height: Math.round(newHPct * 10),
          };
        }
        return el;
      }),
    }));
  };

  const handleStartElementResize = (e, handle, el, pageId) => {
    e.stopPropagation();
    setSelectedFrameId(el.frame_id || el.id);

    const container = e.currentTarget.closest(".page-canvas-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const coords = getElementCoords(el);

    setActiveCustomerTransform({
      type: "resize",
      handle,
      elementId: el.id || el.frame_id,
      pageId,
      startX: e.clientX,
      startY: e.clientY,
      initialLeftPct: coords.left,
      initialTopPct: coords.top,
      initialWPct: coords.width,
      initialHPct: coords.height,
      initialX: Math.round(coords.left * 10),
      initialY: Math.round(coords.top * 10),
      initialW: Math.round(coords.width * 10),
      initialH: Math.round(coords.height * 10),
      containerWidth: rect.width,
      containerHeight: rect.height,
    });
  };

  const handleElementWidthStep = (elementId, delta, pageId) => {
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((page) => {
        if (page.page_id !== pageId && page.page_number !== pageId) return page;
        return {
          ...page,
          elements: (page.elements || []).map((el) => {
            if (el.id === elementId || el.frame_id === elementId) {
              const coords = getElementCoords(el);
              const newWPct = Math.max(5, Math.min(100 - coords.left, +(coords.width + delta * 0.1).toFixed(2)));
              return {
                ...el,
                width_pct: newWPct,
                width_str: `${newWPct}%`,
                unit: "%",
                is_percentage: true,
                width: Math.round(newWPct * 10),
              };
            }
            return el;
          }),
        };
      })
    );
  };

  const handleDuplicateElement = (elementId, pageId) => {
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((page) => {
        if (page.page_id !== pageId && page.page_number !== pageId) return page;
        const target = page.elements?.find((el) => el.id === elementId || el.frame_id === elementId);
        if (!target) return page;
        const clone = {
          ..._.cloneDeep(target),
          id: `clone_${Date.now()}`,
          frame_id: target.type === "photo_frame" ? `frame_${Date.now()}` : undefined,
          x: Math.min(900, (target.x || 0) + 40),
          y: Math.min(900, (target.y || 0) + 40),
        };
        return {
          ...page,
          elements: [...(page.elements || []), clone],
        };
      })
    );
    message.success("Element duplicated!");
  };

  const handleDeleteElement = (elementId, pageId) => {
    pushToUndo(pagesData);
    setPagesData((prev) =>
      prev.map((page) => {
        if (page.page_id !== pageId && page.page_number !== pageId) return page;
        return {
          ...page,
          elements: (page.elements || []).filter((el) => el.id !== elementId && el.frame_id !== elementId),
        };
      })
    );
    setSelectedFrameId(null);
    message.success("Element deleted!");
  };

  const handleApplyPhotoCrop = (cropUpdates) => {
    if (!cropModalFrame) return;
    const { frame_id, id, pageId } = cropModalFrame;
    const targetId = frame_id || id;
    pushToUndo(pagesData);

    setPagesData((prev) =>
      prev.map((page) => {
        const frameExists = page.elements?.some((el) => el.frame_id === targetId || el.id === targetId);
        if (!frameExists) return page;
        return {
          ...page,
          elements: (page.elements || []).map((el) => {
            if (el.frame_id === targetId || el.id === targetId) {
              return {
                ...el,
                crop: { ...(el.crop || {}), ...cropUpdates.crop },
                rotation: cropUpdates.rotation ?? el.rotation,
                fit_mode: cropUpdates.fit_mode ?? el.fit_mode,
              };
            }
            return el;
          }),
        };
      })
    );

    if (editingPageDraft) {
      setEditingPageDraft((prev) => ({
        ...prev,
        elements: (prev.elements || []).map((el) => {
          if (el.frame_id === targetId || el.id === targetId) {
            return {
              ...el,
              crop: { ...(el.crop || {}), ...cropUpdates.crop },
              rotation: cropUpdates.rotation ?? el.rotation,
              fit_mode: cropUpdates.fit_mode ?? el.fit_mode,
            };
          }
          return el;
        }),
      }));
    }

    setCropModalFrame(null);
    message.success("Photo crop applied!");
  };

  // ── Render Template Page on Canvas (1000 x 1000 coordinate system) ────────
  const renderTemplateCanvas = (page, isInteractive = true) => {
    if (!page) return null;
    const elements = page.elements || [];

    // Background style
    const bg = page.background || {};
    const isImage =
      bg.type === "image" ||
      (typeof bg.value === "string" &&
        (bg.value.startsWith("http://") ||
          bg.value.startsWith("https://") ||
          bg.value.startsWith("/uploads/") ||
          bg.value.startsWith("data:image/") ||
          /\.(jpg|jpeg|png|webp|avif|gif|svg)($|\?)/i.test(bg.value)));

    const bgLayerStyle = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 0,
      opacity: bg.opacity ?? 1,
    };

    if (bg.type === "gradient") {
      bgLayerStyle.background = bg.value;
    } else if (isImage && bg.value) {
      const posX = bg.position_x !== undefined ? `${bg.position_x}%` : "50%";
      const posY = bg.position_y !== undefined ? `${bg.position_y}%` : "50%";
      const fitMode = bg.fit_mode || "cover";
      const size =
        fitMode === "stretch" || fitMode === "100% 100%"
          ? "100% 100%"
          : fitMode === "contain"
          ? (bg.scale && bg.scale > 1 ? `${Math.round(bg.scale * 100)}%` : "contain")
          : (bg.scale && bg.scale > 1 ? `${Math.round(bg.scale * 100)}%` : "cover");
      bgLayerStyle.backgroundImage = `url("${bg.value}")`;
      bgLayerStyle.backgroundSize = size;
      bgLayerStyle.backgroundPosition = `${posX} ${posY}`;
      bgLayerStyle.backgroundRepeat = "no-repeat";
      bgLayerStyle.backgroundColor = "#ffffff";
    } else if (bg.value) {
      bgLayerStyle.backgroundColor = bg.value;
    } else {
      bgLayerStyle.backgroundColor = "#ffffff";
    }

    return (
      <div
        className="page-canvas-container relative w-full h-full overflow-hidden select-none bg-white"
        style={{ containerType: "inline-size" }}
        onClick={() => setSelectedFrameId(null)}
      >
        {/* Page Background Layer (Supports Image, Gradient, Color with Opacity) */}
        <div style={bgLayerStyle} />
        {elements.map((el) => {
          const elKey = el.id || el.frame_id;
          const isSelected = isInteractive && (selectedFrameId === el.frame_id || selectedFrameId === el.id);
          const isDragTarget = isInteractive && dragOverFrameId === el.frame_id;

          // Responsive Coordinate conversion with respect to selected paper
          const activeElement = el.type === "decoration"
            ? resolveDbDecorationData(el, extractDatabaseDecorations(templateData))
            : el;
          const coords = getElementCoords(activeElement);
          const leftPct = coords.left;
          const topPct = coords.top;
          const widthPct = coords.width;
          const heightPct = coords.height;

          const shape = el.shape || el.mask_shape || "rectangle";
          const isCircle = shape === "circle";
          const is1to1Shape =
            el.type === "photo_frame" &&
            ["circle", "heart", "star", "scallop", "hexagon"].includes(shape);

          const baseStyle = {
            position: "absolute",
            left: `${leftPct}%`,
            top: `${topPct}%`,
            width: `${widthPct}%`,
            height: is1to1Shape ? undefined : `${heightPct}%`,
            aspectRatio: is1to1Shape ? "1 / 1" : undefined,
            zIndex: isSelected ? 50 : el.z_index || 1,
            transform: `rotate(${el.rotation || 0}deg)`,
            transformOrigin: "center center",
          };

          // ── TYPE 1: PHOTO FRAME ──────────────────────────────────────────
          if (el.type === "photo_frame") {
            const displayPhoto =
              el.photo_url ||
              el.photo?.url ||
              el.photo?.preview ||
              el.image_url ||
              el.url ||
              el.src ||
              el.test_image_url ||
              el.sample_image_url ||
              "";
            const hasPhoto = Boolean(displayPhoto);
            const fitMode = el.fit_mode || "cover";
            const borderWidth = el.border?.width || 0;
            const borderColor = el.border?.color || "#ffffff";
            const elRefDim = Math.max(
              50,
              Math.min(
                Number(el.width) > 10 ? Number(el.width) : (coords.width * 10),
                Number(el.height) > 10 ? Number(el.height) : (coords.height * 10)
              ) || 400
            );
            const normalizedBorderStroke = borderWidth / elRefDim;
            const shadow = el.shadow || {};
            const shadowFilter =
              shadow.blur > 0
                ? `drop-shadow(${shadow.offsetX || 0}px ${shadow.offsetY || 4}px ${shadow.blur}px ${
                    shadow.color || "rgba(0,0,0,0.15)"
                  })`
                : "none";

            const radiusVal = el.border?.radius ?? el.corner_radius ?? (isCircle ? 50 : 0);
            const clipDef = getShapeClipPathDefinition(shape, radiusVal);
            const clipId = `cust-clip-${page.page_id || page.page_number || "pg"}-${elKey}`;

            const cropZoom = el.crop?.zoom || 1;
            const cropOffsetX = el.crop?.offsetX || 0;
            const cropOffsetY = el.crop?.offsetY || 0;
            const cropRotation = el.crop?.rotation || 0;
            const isFlipped = Boolean(el.crop?.flipH || el.flip_h);

            return (
              <div
                key={elKey}
                style={{
                  ...baseStyle,
                  filter: shadowFilter,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInteractive) setSelectedFrameId(el.frame_id || el.id);
                }}
                onMouseDown={(e) => {
                  if (isInteractive) handleStartElementMove(e, el, page.page_id || page.page_number);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (isInteractive) setDragOverFrameId(el.frame_id);
                }}
                onDragLeave={() => isInteractive && setDragOverFrameId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const photoDataStr = e.dataTransfer.getData("application/json");
                  if (photoDataStr) {
                    try {
                      const photo = JSON.parse(photoDataStr);
                      handleFrameDrop(el.frame_id, photo);
                    } catch (err) {
                      console.error("Drop parse error:", err);
                    }
                  }
                }}
                className={`group relative overflow-visible transition-all flex items-center justify-center cursor-move`}
              >
                {/* SVG Defs for objectBoundingBox clip */}
                <svg width="0" height="0" className="absolute pointer-events-none">
                  <defs>
                    <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                      {renderShapeSvgClip(clipDef, false)}
                    </clipPath>
                  </defs>
                </svg>

                {/* Clipped container: HTML clipping with clipPathUnits="objectBoundingBox" guarantees 100% boundary locking */}
                <div
                  className="w-full h-full relative overflow-hidden"
                  style={{
                    clipPath: `url(#${clipId})`,
                    WebkitClipPath: `url(#${clipId})`,
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: hasPhoto ? "transparent" : "#f1f5f9" }}
                  />

                  {hasPhoto && (
                    <img
                      src={displayPhoto}
                      alt=""
                      style={{
                        position: "absolute",
                        left: `${cropOffsetX}%`,
                        top: `${cropOffsetY}%`,
                        width: "100%",
                        height: "100%",
                        objectFit:
                          fitMode === "contain"
                            ? "contain"
                            : fitMode === "stretch" || fitMode === "fill"
                            ? "fill"
                            : "cover",
                        transformOrigin: "50% 50%",
                        transform: `scale(${isFlipped ? -cropZoom : cropZoom}, ${cropZoom}) rotate(${cropRotation}deg)`,
                        transition: "transform 0.1s ease",
                        maxWidth: "none",
                        maxHeight: "none",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    />
                  )}

                  {!hasPhoto && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetPhotoSlot(el.frame_id || el.id);
                        setIsReplacePhotoModalOpen(true);
                      }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-auto cursor-pointer"
                    >
                      <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm mb-1 text-slate-500 group-hover:scale-110 transition-transform">
                        <PictureOutlined className="text-xl text-teal-600" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                        {el.frame_id ? `Photo ${el.frame_id.split('-').pop()}` : "Add Photo"}
                      </span>
                      <span className="text-[9px] text-slate-400 capitalize">
                        {shape} • {fitMode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Border overlay following the exact clip shape */}
                {borderWidth > 0 && (
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 10 }}
                  >
                    <g
                      transform="scale(100, 100)"
                      fill="none"
                      stroke={borderColor}
                      strokeWidth={normalizedBorderStroke}
                      vectorEffect="non-scaling-stroke"
                    >
                      {renderShapeSvgClip(clipDef, false)}
                    </g>
                  </svg>
                )}

                {/* Adobe Photoshop Transform Selection Box & Handles */}
                {isSelected && isInteractive && (
                  <>
                    {/* Vibrant Selection Border */}
                    <div className="absolute inset-0 border-2 border-[#00a896] pointer-events-none shadow-sm" />

                    {/* Photoshop-like 8 Resize Handles (NW, N, NE, E, SE, S, SW, W) */}
                    {RESIZE_HANDLES.map((h) => (
                      <div
                        key={h.position}
                        onMouseDown={(e) => handleStartElementResize(e, h.position, el, page.page_id || page.page_number)}
                        style={{ cursor: h.cursor }}
                        className={`absolute ${h.className} w-2.5 h-2.5 bg-white border-2 border-[#00a896] rounded-xs shadow-xs pointer-events-auto z-40 hover:scale-125 transition-transform`}
                        title={`Drag to resize (${h.position})`}
                      />
                    ))}

                    {/* Mini Photoshop Quick Toolbar */}
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-lg shadow-xl pointer-events-auto z-50 text-[10px] whitespace-nowrap"
                    >
                      {hasPhoto && (
                        <button
                          type="button"
                          onClick={() => setCropModalFrame({ ...el, pageId: page.page_id || page.page_number })}
                          className="hover:text-teal-400 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
                          title="Photoshop Crop & Pan"
                        >
                          <ScissorOutlined className="text-xs text-teal-400" />
                          <span>Crop</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPhotoSlot(el.frame_id || el.id);
                          setIsReplacePhotoModalOpen(true);
                        }}
                        className="hover:text-teal-400 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
                        title="Replace Photo"
                      >
                        <PictureOutlined className="text-xs" />
                        <span>{hasPhoto ? "Swap" : "Add"}</span>
                      </button>
                      <div className="w-px h-3 bg-slate-700 mx-0.5" />
                      {/* Width adjustments */}
                      <button
                        type="button"
                        onClick={() => handleElementWidthStep(el.id || el.frame_id, -20, page.page_id || page.page_number)}
                        className="hover:text-teal-400 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors font-mono"
                        title="Decrease Width"
                      >
                        W-
                      </button>
                      <span className="text-[9px] text-slate-400 font-mono px-0.5">
                        {Math.round(widthPct)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleElementWidthStep(el.id || el.frame_id, 20, page.page_id || page.page_number)}
                        className="hover:text-teal-400 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors font-mono"
                        title="Increase Width"
                      >
                        W+
                      </button>
                      <div className="w-px h-3 bg-slate-700 mx-0.5" />
                      {hasPhoto && (
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhotoFromFrame(el.frame_id, e)}
                          className="hover:text-rose-400 text-slate-400 px-1 py-0.5"
                          title="Remove Photo"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteElement(el.id || el.frame_id, page.page_id || page.page_number)}
                        className="hover:text-rose-400 text-rose-300 px-1 py-0.5"
                        title="Delete Element"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          }

          // ── TYPE 2: TEXT ─────────────────────────────────────────────────
          if (el.type === "text") {
            const hasExplicitNewlines = el.content && String(el.content).includes("\n");
            return (
              <div
                key={elKey}
                style={{
                  ...baseStyle,
                  width: `${widthPct}%`,
                  maxWidth: "100%",
                  fontFamily: getFontFamilyFallback(el.font_family || "Playfair Display"),
                  fontSize: `calc(${Number(el.font_size || 24)} * (100cqw / 707))`,
                  fontWeight: el.font_weight || "normal",
                  fontStyle: el.font_style || "normal",
                  letterSpacing: el.letter_spacing ? `calc(${Number(el.letter_spacing)} * (100cqw / 707))` : "normal",
                  lineHeight: el.line_height || 1.2,
                  color: el.color || "#1f2937",
                  textAlign: el.align || "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    el.align === "left"
                      ? "flex-start"
                      : el.align === "right"
                      ? "flex-end"
                      : "center",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: hasExplicitNewlines ? "pre-line" : "normal",
                  border: isSelected && isInteractive ? "2px solid #00a896" : "none",
                  zIndex: isSelected ? 150 : Math.max(100, Number(el.z_index) || 100),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInteractive) setSelectedFrameId(el.id);
                }}
                onMouseDown={(e) => {
                  if (isInteractive) handleStartElementMove(e, el, page.page_id || page.page_number);
                }}
                className={`leading-tight cursor-move select-none ${
                  isSelected && isInteractive ? "relative" : ""
                }`}
              >
                {isInteractive && el.is_customer_editable ? (
                  <input
                    type="text"
                    value={el.content || ""}
                    onChange={(e) => handleTextContentChange(el.id, e.target.value)}
                    className="w-full bg-transparent hover:bg-white/10 focus:bg-white/20 border border-transparent hover:border-white/30 focus:border-amber-400 rounded outline-none px-1 transition-colors"
                    style={{
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      fontWeight: "inherit",
                      fontStyle: "inherit",
                      letterSpacing: "inherit",
                      lineHeight: "inherit",
                      color: "inherit",
                      textAlign: el.align || "center",
                    }}
                  />
                ) : (
                  <span style={{ minWidth: "max-content", maxWidth: "100%", whiteSpace: hasExplicitNewlines ? "pre-line" : "nowrap", wordBreak: "normal", overflowWrap: "normal", textAlign: el.align || "center", fontFamily: "inherit", fontWeight: "inherit", fontStyle: "inherit", letterSpacing: "inherit" }}>
                    {el.content}
                  </span>
                )}

                {/* Transform Handles for Text - Only for customer-editable text */}
                {isSelected && isInteractive && el.is_customer_editable && (
                  <>
                    {RESIZE_HANDLES.map((h) => (
                      <div
                        key={h.position}
                        onMouseDown={(e) => handleStartElementResize(e, h.position, el, page.page_id || page.page_number)}
                        style={{ cursor: h.cursor }}
                        className={`absolute ${h.className} w-2.5 h-2.5 bg-white border-2 border-[#00a896] rounded-xs shadow-xs pointer-events-auto z-40 hover:scale-125 transition-transform`}
                        title={`Drag to resize (${h.position})`}
                      />
                    ))}

                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-lg shadow-xl pointer-events-auto z-50 text-[10px] whitespace-nowrap"
                    >
                      <button
                        type="button"
                        onClick={() => handleElementWidthStep(el.id, -20, page.page_id || page.page_number)}
                        className="hover:text-teal-400 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors font-mono"
                        title="Decrease Width"
                      >
                        W-
                      </button>
                      <span className="text-[9px] text-slate-400 font-mono px-0.5">
                        {Math.round(el.width)}px
                      </span>
                      <button
                        type="button"
                        onClick={() => handleElementWidthStep(el.id, 20, page.page_id || page.page_number)}
                        className="hover:text-teal-400 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors font-mono"
                        title="Increase Width"
                      >
                        W+
                      </button>
                      <div className="w-px h-3 bg-slate-700 mx-0.5" />
                      <button
                        type="button"
                        onClick={() => handleDeleteElement(el.id, page.page_id || page.page_number)}
                        className="hover:text-rose-400 text-rose-300 px-1 py-0.5"
                        title="Delete Text"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          }

          // ── TYPE 3: DECORATION ───────────────────────────────────────────
          if (el.type === "decoration") {
            const dec = activeElement;
            const svgContent = resolveDecorationSvg(dec);
            const hasSvg = Boolean(svgContent);
            const hasAsset = Boolean(dec.asset_url);
            const isExplicitButterfly = dec.shape === "butterfly" || dec.custom_svg_path === "butterfly";
            const isExplicitHeart = dec.shape === "heart" || dec.custom_svg_path === "heart";

            return (
              <div
                key={elKey}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInteractive) setSelectedFrameId(el.id || el.frame_id);
                }}
                onMouseDown={(e) => {
                  if (isInteractive) handleStartElementMove(e, dec, page.page_id || page.page_number);
                }}
                style={{
                  ...baseStyle,
                  opacity: dec.opacity ?? 1,
                  color: dec.tint || "currentColor",
                  cursor: isInteractive ? "move" : "default",
                }}
                className={`flex items-center justify-center select-none group relative overflow-visible ${
                  isSelected && isInteractive ? "ring-2 ring-[#00a896]" : ""
                }`}
              >
                {/* Artwork display */}
                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                  {hasSvg ? (
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : hasAsset ? (
                    <img
                      src={dec.asset_url}
                      alt={dec.name || "Decoration"}
                      style={{
                        objectFit: dec.fit_mode || "contain",
                      }}
                      className="w-full h-full pointer-events-none select-none"
                    />
                  ) : isExplicitButterfly ? (
                    <svg viewBox="0 0 24 24" fill={el.tint || "#f43f5e"} className="w-full h-full drop-shadow">
                      <path d="M12 4.5C12.5 3 14 2 16 2c2.5 0 4.5 2 4.5 4.5 0 2.5-2.5 4.5-5 5.5 3 .5 5.5 2.5 5.5 5.5 0 3-2.5 5.5-5.5 5.5-2 0-3.5-1-4-2.5-.5 1.5-2 2.5-4 2.5C4.5 23 2 20.5 2 17.5c0-3 2.5-5 5.5-5.5-2.5-1-5-3-5-5.5C2.5 4 4.5 2 7 2c2 0 3.5 1 4 2.5l1 1 1-1z" />
                    </svg>
                  ) : isExplicitHeart ? (
                    <svg viewBox="0 0 24 24" fill={el.tint || "#ec4899"} className="w-full h-full drop-shadow">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  ) : isInteractive ? (
                    <div className="w-full h-full border border-dashed border-teal-300 bg-teal-50/40 rounded flex items-center justify-center text-teal-700 text-xs font-semibold px-1 text-center">
                      {el.name || "Element"}
                    </div>
                  ) : null}
                </div>

                {/* Transform Handles for Decoration (Resize Width & Height) */}
                {isSelected && isInteractive && (
                  <>
                    <div className="absolute inset-0 border-2 border-[#00a896] pointer-events-none shadow-sm" />

                    {RESIZE_HANDLES.map((h) => (
                      <div
                        key={h.position}
                        onMouseDown={(e) => handleStartElementResize(e, h.position, el, page.page_id || page.page_number)}
                        style={{ cursor: h.cursor }}
                        className={`absolute ${h.className} w-2.5 h-2.5 bg-white border-2 border-[#00a896] rounded-xs shadow-xs pointer-events-auto z-40 hover:scale-125 transition-transform`}
                        title={`Drag to resize (${h.position})`}
                      />
                    ))}

                    {/* Quick Toolbar */}
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-lg shadow-xl pointer-events-auto z-50 text-[10px] whitespace-nowrap"
                    >
                      <button
                        type="button"
                        onClick={() => handleElementWidthStep(el.id || el.frame_id, -20, page.page_id || page.page_number)}
                        className="hover:text-teal-400 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors font-mono"
                        title="Decrease Width"
                      >
                        W-
                      </button>
                      <span className="text-[9px] text-slate-400 font-mono px-0.5">
                        {Math.round(el.width)}px
                      </span>
                      <button
                        type="button"
                        onClick={() => handleElementWidthStep(el.id || el.frame_id, 20, page.page_id || page.page_number)}
                        className="hover:text-teal-400 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors font-mono"
                        title="Increase Width"
                      >
                        W+
                      </button>
                      <div className="w-px h-3 bg-slate-700 mx-0.5" />
                      <button
                        type="button"
                        onClick={() => handleDuplicateElement(el.id || el.frame_id, page.page_id || page.page_number)}
                        className="hover:text-teal-400 text-slate-300 px-1 py-0.5 rounded hover:bg-slate-800 transition-colors"
                        title="Duplicate Element"
                      >
                        <CopyOutlined className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteElement(el.id || el.frame_id, page.page_id || page.page_number)}
                        className="hover:text-rose-400 text-rose-300 px-1 py-0.5"
                        title="Delete Element"
                      >
                        <DeleteOutlined className="text-xs" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // ── Step 3: Photo Holders Completeness Checker ─────────────────────────────
  const checkPhotoHoldersCompleteness = () => {
    const missingByPage = [];
    let totalMissingFrames = 0;

    (pagesData || []).forEach((pg, pgIdx) => {
      if (pg.is_blank || pg.page_type === "blank") return;

      const frames = (pg.elements || []).filter(
        (el) => el.type === "photo_frame" || el.type === "image_frame"
      );
      if (frames.length === 0) return;

      const emptyFrames = frames.filter((f) => {
        const url =
          f.photo_url ||
          f.photo?.url ||
          f.photo?.preview ||
          f.image_url ||
          f.url ||
          f.src;
        return !(
          url &&
          typeof url === "string" &&
          url.trim() !== "" &&
          url !== "null" &&
          url !== "undefined"
        );
      });

      if (emptyFrames.length > 0) {
        totalMissingFrames += emptyFrames.length;
        const totalFrames = frames.length;
        const emptyCount = emptyFrames.length;
        const filledCount = totalFrames - emptyCount;

        const pageLabel =
          (pg.page_type === "front_cover" || pg.page_id === "front-cover")
            ? "Front Cover"
            : (pg.page_type === "back_cover" || pg.page_id === "back-cover")
            ? "Back Cover"
            : typeof pg.page_number === "number"
            ? `Page ${pg.page_number}`
            : pg.display_label || pg.name || `Page ${pgIdx + 1}`;

        // Find the spread index in spreads array that contains this page
        const spreadIdx = (spreads || []).findIndex(
          (sp) =>
            sp.leftPage?.page_id === pg.page_id ||
            sp.rightPage?.page_id === pg.page_id ||
            (pg.page_number && (sp.leftPage?.page_number === pg.page_number || sp.rightPage?.page_number === pg.page_number)) ||
            (pg.page_type === "front_cover" && (sp.rightPage?.page_type === "front_cover" || sp.id === "spread-cover")) ||
            (pg.page_type === "back_cover" && (sp.leftPage?.page_type === "back_cover" || sp.id === "spread-cover"))
        );

        missingByPage.push({
          pageIndex: pgIdx,
          pageId: pg.page_id || pg.id,
          pageLabel,
          totalFrames,
          emptyCount,
          filledCount,
          spreadIdx: spreadIdx !== -1 ? spreadIdx : 0,
        });
      }
    });

    return {
      missingByPage,
      totalMissingFrames,
      isComplete: missingByPage.length === 0,
    };
  };

  // ── Review & Cart Handler: Checks All Photoholders ─────────────────────────
  const handleReviewAndCartClick = () => {
    const { missingByPage, isComplete } = checkPhotoHoldersCompleteness();

    if (!isComplete) {
      const firstMissing = missingByPage[0];
      const pageLabel = firstMissing?.pageLabel || "This page";

      // Simple notification identifying only the first page with an empty photo placeholder
      message.destroy();
      toast.dismiss();
      const notificationMsg = `${pageLabel} has no image.`;
      toast.error(notificationMsg, {
        duration: 4000,
        id: "empty-page-photo-notice",
      });
      message.error(notificationMsg, 4);

      // Jump and scroll directly to the first incomplete page
      if (firstMissing) {
        if (currentStep !== 3) {
          setCurrentStep(3);
        }
        setActivePageIndex(firstMissing.pageIndex);
        if (typeof firstMissing.spreadIdx === "number" && firstMissing.spreadIdx >= 0) {
          setTimeout(() => {
            scrollToSpread(firstMissing.spreadIdx);
          }, 120);
        }
      }
      return;
    }

    // All photo holders have images uploaded! Open Add to Cart / Stay Here modal
    setMaxUnlockedStep((prev) => Math.max(prev, 4));
    setIsAddToCartConfirmModalOpen(true);
  };

  // ── Execute Real Add to Cart (From Modal) ───────────────────────────────────
  const handleExecuteAddToCart = async () => {
    try {
      setIsAddingToCart(true);

      if (current_working_id) {
        try {
          await saveDesignToBackend(false);
          await validatePhotoBookDesign(current_working_id);
        } catch (e) {
          console.warn("Pre-cart save/validation:", e);
        }
      }

      const guestId = localStorage.getItem("guestId") || "";
      const coverImg =
        pagesData[0]?.elements?.find((el) => el.type === "photo_frame" && el.photo_url)?.photo_url ||
        uploadedPhotos[0]?.url ||
        "";

      const cartItemPayload = {
        product_id: productData?._id || designData?.product_id,
        product_name: productData?.name || "Custom Photo Book",
        product_image: coverImg || productData?.images?.[0]?.url || "",
        product_price: priceDetails.basePrice,
        product_quantity: 1,
        final_total: priceDetails.finalTotal,
        final_total_withoutGst: priceDetails.taxableTotal,
        cgst: Number((priceDetails.gstRate / 2).toFixed(2)),
        sgst: Number((priceDetails.gstRate / 2).toFixed(2)),
        guestId,
        userRole: user?.role || "guest",
        user_id: user?._id || user?.id || null,
        is_photobook: true,
        photobook_design_id: current_working_id,
        photobook_pages: photoBookPages,
        photobook_size: activeSizeInfo.dimensions || activeSizeInfo.name || selectedSize,
        photobook_size_name: activeSizeInfo.dimensions || activeSizeInfo.name,
        photobook_size_id: selectedSize,
        photobook_extra_pages: priceDetails.extraPages,
        photobook_extra_page_price: priceDetails.extraPricePerUnit,
        photobook_extra_pages_cost: priceDetails.extraPagesCost,
        photobook_variants: {
          Size: activeSizeInfo.dimensions || activeSizeInfo.name || selectedSize,
          Edition: selectedVariant,
          Template: selectedTemplateName,
        },
        photobook_template_name: selectedTemplateName,
        photobook_edition_name: selectedVariant,
        photobook_design_data: {
          template_name: selectedTemplateName,
          pages: (pagesData || []).map((page) => ({
            ...page,
            elements: (page.elements || []).map((el) => normalizeElementToPaperCoords(el)),
          })),
          uploaded_photos: uploadedPhotos,
          cover_image: coverImg,
        },
        photobook_cover_image: coverImg,
      };

      const result = await addToShoppingCart(cartItemPayload);
      dispatch(ADD_TO_CART(_.get(result, "data.data.data", "")));

      setIsAddToCartConfirmModalOpen(false);

      toast.success("Photo Book added to cart successfully!", { duration: 4000 });
      navigate("/shopping-cart");
    } catch (err) {
      console.error("Cart addition failed:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ── Stay Here Handler (From Modal) ─────────────────────────────────────────
  const handleStayHere = async () => {
    setIsAddToCartConfirmModalOpen(false);
    if (current_working_id) {
      try {
        await saveDesignToBackend(false);
        toast.success("Your photo book design has been saved. You can continue customizing!", {
          duration: 3500,
          id: "stay-here-saved",
        });
      } catch (e) {
        console.warn("Silent save on stay here:", e);
      }
    }
  };

  // Alias for backward compatibility
  const handleAddToCart = handleReviewAndCartClick;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <Spin size="large" />
        <h3 className="mt-4 text-base font-semibold text-gray-200">
          Loading {selectedTemplateName} Studio...
        </h3>
        <p className="text-xs text-gray-400">Applying template geometry, frames, and typography</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#f5f6f8] text-gray-800 select-none overflow-hidden font-sans">
      {/* React Hot Toast notification container with highest z-index */}
      <Toaster
        position="top-center"
        containerStyle={{ zIndex: 999999, top: "24px" }}
        toastOptions={{
          duration: 7000,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            fontSize: "12px",
            zIndex: 999999,
          },
        }}
      />

      {/* ── Studio Top Header (Matching Admin Exact UI & Palette) ────────────── */}
      <header className="h-[58px] bg-[#0f172a] border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 text-white select-none">
        {/* Left Side: Printe Branding + Back Arrow + Book Title */}
        <div className="flex items-center gap-2.5 min-w-[140px]">
          <div className="w-7 h-7 rounded-lg bg-[#00a896] text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-teal-500/20">
            P
          </div>
          <span className="font-bold text-white tracking-wide text-sm hidden sm:inline">
            Printe
          </span>
          <div className="w-px h-4 bg-slate-700 hidden sm:block" />
          <Link
            to={`/product/${encodeURIComponent(product_name)}`}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold text-xs px-2 py-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <LeftOutlined className="text-[10px]" />
            <span>Back</span>
          </Link>
          <span className="text-xs font-medium text-slate-300 truncate max-w-[160px] hidden lg:inline">
            {product_name || "Photo Book"}
          </span>
        </div>

        {/* Center: 4-Step Stepper (Your Book, Upload Photos, Edit Your Book, Review & Cart) */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2.5 select-none text-xs">
          {[
            { step: 1, label: "Your Book" },
            { step: 2, label: "Upload Photos" },
            { step: 3, label: "Edit Your Book" },
            { step: 4, label: "Review & Cart" },
          ].map(({ step, label }, idx, arr) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;
            const isLocked = step === 4 ? false : step > maxUnlockedStep;

            const handleStepperClick = () => {
              if (step === 4) {
                handleReviewAndCartClick();
                return;
              }

              if (step === currentStep) return;

              if (step < currentStep) {
                setCurrentStep(step);
                return;
              }

              if (step > maxUnlockedStep) {
                if (currentStep === 1) {
                  message.warning("Please configure your book and click 'Next - Upload photos' to proceed.");
                } else if (currentStep === 2) {
                  if (uploadedPhotos.length === 0) {
                    message.warning("Please upload at least 1 photo before proceeding to album editor.");
                  } else {
                    message.warning("Please click 'Next: Arrange & Edit Album' to proceed.");
                  }
                } else {
                  message.warning("Please complete the current step before proceeding.");
                }
                return;
              }

              if (step === 3) {
                if (uploadedPhotos.length > 0) {
                  syncPhotosToPages(uploadedPhotos, photosPerPageMode);
                }
              }
              setCurrentStep(step);
            };

            return (
              <React.Fragment key={step}>
                <button
                  type="button"
                  onClick={handleStepperClick}
                  title={isLocked ? "Complete previous step to unlock" : label}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all ${
                    isLocked
                      ? "bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60"
                      : isActive
                      ? "bg-[#00a896] text-white shadow-md shadow-teal-500/25 border border-teal-400 cursor-pointer"
                      : isCompleted
                      ? "bg-teal-950/70 text-teal-300 border border-teal-700/60 hover:bg-teal-900/60 cursor-pointer"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 cursor-pointer"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                      isActive
                        ? "bg-white text-[#00a896]"
                        : isCompleted
                        ? "bg-[#00a896] text-white"
                        : isLocked
                        ? "bg-slate-700 text-slate-400"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {isCompleted ? "✓" : step}
                  </span>
                  <span>{label}</span>
                </button>
                {idx < arr.length - 1 && (
                  <div
                    className={`w-5 lg:w-8 h-0.5 transition-colors ${
                      currentStep > step ? "bg-[#00a896]" : "bg-slate-700"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Save Status + Explicit Save + Preview + Undo/Redo & Primary CTA */}
        <div className="flex items-center gap-2 md:gap-2.5 min-w-[140px] justify-end">
          {/* Save Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs select-none">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Spin size="small" /> Saving...
              </span>
            ) : saveStatusText === "Save failed" ? (
              <span
                onClick={() => saveDesignToBackend(true)}
                className="flex items-center gap-1 text-rose-400 font-medium cursor-pointer hover:underline"
                title="Click to retry save"
              >
                <CloseCircleOutlined className="text-xs" /> Save failed (Retry)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-teal-300 font-medium">
                <CheckCircleOutlined className="text-xs" /> Saved
              </span>
            )}
          </div>

          {/* Explicit Save Design Action */}
          <button
            type="button"
            onClick={() => saveDesignToBackend(true)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 border border-teal-500 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Save your photo book design to backend"
          >
            <SaveOutlined className="text-xs" />
            <span className="hidden sm:inline">Save Design</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewSpreadModalIndex(0);
              setIsPreviewModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <EyeOutlined className="text-xs" />
            <span>Preview</span>
          </button>

          {currentStep !== 1 && (
            <>
              <div className="flex items-center gap-1 text-slate-400 mr-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                    undoStack.length === 0 ? "opacity-30 cursor-not-allowed" : "text-slate-300 hover:text-white"
                  }`}
                  title="Undo"
                >
                  <UndoOutlined className="text-sm" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                    redoStack.length === 0 ? "opacity-30 cursor-not-allowed" : "text-slate-300 hover:text-white"
                  }`}
                  title="Redo"
                >
                  <RedoOutlined className="text-sm" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleReviewAndCartClick}
                disabled={isAddingToCart}
                className="bg-[#0284c7] hover:bg-sky-600 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all shadow-md shadow-sky-950/40 flex items-center gap-1.5 cursor-pointer"
              >
                {isAddingToCart ? (
                  <Spin size="small" />
                ) : (
                  <>
                    <ShoppingCartOutlined />
                    <span>Review & Cart - ₹{priceDetails.finalTotal}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── STEP 1: YOUR BOOK (Photo Count & Photos-Per-Page Density) ──────── */}
      {currentStep === 1 && (
        <YourBookStep
          photoBookPages={photoBookPages}
          targetPhotoCount={targetPhotoCount}
          setTargetPhotoCount={setTargetPhotoCount}
          photosPerPageMode={photosPerPageMode}
          setPhotosPerPageMode={setPhotosPerPageMode}
          priceDetails={priceDetails}
          onProceedToUpload={() => {
            setMaxUnlockedStep((prev) => Math.max(prev, 2));
            setCurrentStep(2);
          }}
        />
      )}

      {/* ── STEP 2: UPLOAD PHOTOS ────────────────────────────────────────── */}
      {currentStep === 2 && (
        <UploadPhotosStep
          targetPhotoCount={targetPhotoCount}
          uploadedPhotos={uploadedPhotos}
          isUploading={isUploading}
          uploadPercent={uploadPercent}
          handleFilesSelected={handleFilesSelected}
          handleDeletePhoto={handleDeletePhoto}
          handlePhotoDragStart={handlePhotoDragStart}
          handlePhotoDragOver={handlePhotoDragOver}
          handlePhotoDrop={handlePhotoDrop}
          onPreviewPhoto={(url) => setPreviewModalUrl(url)}
          onBack={() => setCurrentStep(1)}
          onProceedToEdit={() => {
            if (uploadedPhotos.length === 0) {
              message.warning("Please upload at least 1 photo before proceeding to album editor.");
              return;
            }
            setMaxUnlockedStep((prev) => Math.max(prev, 3));
            syncPhotosToPages(uploadedPhotos, photosPerPageMode);
            setCurrentStep(3);
          }}
        />
      )}

      {/* ── STEP 3: EDIT YOUR BOOK (3-Container Studio Layout matching Reference UI) ──── */}
      {(currentStep === 3 || currentStep === 4) && (
        <div className="flex-1 flex flex-row h-[calc(100vh-56px)] w-full overflow-hidden bg-[#eaebee] relative select-none">
          {/* ================================================================= */}
          {/* CONTAINER 1: SLIM LEFT TOOLBAR (w-[68px])                         */}
          {/* ================================================================= */}
          <aside className="w-[74px] bg-white border-r border-gray-200/90 flex flex-col items-center py-4 justify-between z-20 shrink-0 select-none shadow-xs">
            <div className="flex flex-col items-center gap-2.5 w-full">
              {[
                { id: "add", label: "Add", icon: <PlusOutlined />, desc: "Add Photos" },
                { id: "arrange", label: "Arrange", icon: <AppstoreOutlined />, desc: "Arrange Spreads" },
                { id: "size", label: "Size", icon: <BorderOutlined />, desc: "Book Size" },
                { id: "design", label: "Design", icon: <BgColorsOutlined />, desc: "Themes" },
                { id: "options", label: "Options", icon: <SettingOutlined />, desc: "Book Options" },
              ].map((tool) => {
                const isActive = activeStudioTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveStudioTool((prev) => (prev === tool.id ? null : tool.id))}
                    className={`w-[58px] py-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative group ${
                      isActive
                        ? "bg-teal-50 text-[#00a896] shadow-2xs ring-1 ring-teal-200 font-bold"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    title={tool.desc}
                  >
                    {isActive && (
                      <span className="absolute -left-[8px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#00a896] rounded-r-full shadow-xs" />
                    )}
                    <div className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-[#00a896]" : "text-gray-500 group-hover:text-gray-900"}`}>
                      {tool.icon}
                    </div>
                    <span className={`text-[10px] mt-1 tracking-tight ${isActive ? "font-bold text-[#00a896]" : "font-medium text-gray-600 group-hover:text-gray-900"}`}>
                      {tool.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Help Tooltip */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-100 w-full px-2">
              <Tooltip title="Photo book editor studio • Click any tool to toggle panel" placement="right">
                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-[#00a896] hover:bg-teal-50 flex items-center justify-center text-xs cursor-pointer transition-colors">
                  <InfoCircleOutlined />
                </div>
              </Tooltip>
            </div>
          </aside>

          {/* ================================================================= */}
          {/* CONTAINER 2: CENTER SPREADS WORKSPACE (flex-1)                    */}
          {/* ================================================================= */}
          <main
            ref={centerScrollRef}
            className="flex-1 bg-[#eaebee] relative overflow-y-auto px-4 md:px-8 py-6 flex flex-col items-center scroll-smooth"
          >
            {/* Top Subtitle Bar: THE BOOK • {photoBookPages} PAGES (INCL. COVERS) */}
            <div
              className="w-full flex items-center justify-between mb-4 transition-all duration-300"
              style={{
                maxWidth: `${Math.max(620, Math.min(1060, Math.round(440 * (activeSizeInfo.spreadRatio || 2))))}px`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase">
                  THE BOOK • {photoBookPages} PAGES (INCL. COVERS)
                </span>
                <span className="text-[11px] font-semibold text-[#00a896] bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <EditOutlined className="text-[10px]" /> Click any page to edit
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewSpreadModalIndex(0);
                  setIsPreviewModalOpen(true);
                }}
                className="text-[#00a896] hover:text-[#008f80] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                {/* <EyeOutlined /> Flip Preview */}
              </button>
            </div>

            {/* Floating Chevrons Navigation (Up / Down) */}
            <div className="fixed right-[340px] top-1/2 -translate-y-1/2 flex flex-col gap-2 z-30">
              <button
                type="button"
                onClick={scrollToPrevSpread}
                disabled={currentSpreadIndex === 0}
                className={`w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 transition-all ${
                  currentSpreadIndex === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-50 hover:text-black hover:scale-105 cursor-pointer"
                }`}
                title="Previous Spread"
              >
                <UpOutlined className="text-xs" />
              </button>
              <button
                type="button"
                onClick={scrollToNextSpread}
                disabled={currentSpreadIndex >= spreads.length - 1}
                className={`w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 transition-all ${
                  currentSpreadIndex >= spreads.length - 1
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-gray-50 hover:text-black hover:scale-105 cursor-pointer"
                }`}
                title="Next Spread"
              >
                <DownOutlined className="text-xs" />
              </button>
            </div>

            {/* List of 2-Page Spreads */}
            <div
              className="w-full flex flex-col items-center transition-all duration-300"
              style={{
                maxWidth: `${Math.max(620, Math.min(1060, Math.round(440 * (activeSizeInfo.spreadRatio || 2))))}px`,
              }}
            >
              {spreads.map((spread, sIdx) => {
                const isCoverSpread = sIdx === 0;
                return (
                  <div
                    key={spread.id}
                    id={spread.id}
                    className="w-full mb-8 flex flex-col items-center scroll-mt-6"
                  >
                    {/* 2-Page Spread Realistic Book Card (Exact Sharp Border-radius-0 from Selected Size) */}
                    <div
                      className="w-full bg-white rounded-none shadow-md border border-gray-300 flex overflow-hidden relative transition-all duration-300"
                      style={{
                        aspectRatio: `${activeSizeInfo.spreadRatio}`,
                      }}
                    >
                      {/* Left Page */}
                      <div
                        onClick={() => {
                          if (spread.leftPage && !spread.leftPage.is_blank) {
                            handleOpenPageEditModal(spread.leftPage);
                          }
                        }}
                        className={`w-1/2 h-full relative border-r border-gray-200 flex flex-col group ${
                          spread.leftPage && !spread.leftPage.is_blank ? "cursor-pointer" : ""
                        }`}
                      >
                        {spread.leftPage ? (
                          spread.leftPage.is_blank ? (
                            <div className="w-full h-full bg-[#fafaf9] flex flex-col items-center justify-center text-center p-6 select-none relative">
                              <span className="text-gray-300 tracking-widest text-[11px] font-bold uppercase">
                                THIS PAGE IS LEFT BLANK
                              </span>
                            </div>
                          ) : (
                            <div className="w-full h-full relative overflow-hidden group/canvas">
                              <div className="w-full h-full transition-all duration-200 group-hover/canvas:ring-2 group-hover/canvas:ring-[#00a896]/50">
                                {renderTemplateCanvas(spread.leftPage, false)}
                              </div>
                              {/* Centered Edit Overlay with background blur & low opacity on hover */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPageEditModal(spread.leftPage);
                                }}
                                className="absolute inset-0 z-[200] flex items-center justify-center opacity-0 group-hover/canvas:opacity-100 transition-all duration-200 bg-slate-900/20 backdrop-blur-[2px] cursor-pointer"
                              >
                                <span className="bg-white/95 hover:bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-full shadow-lg border border-gray-200/90 flex items-center gap-2 transform translate-y-1 group-hover/canvas:translate-y-0 hover:scale-105 active:scale-95 transition-all">
                                  <EditOutlined className="text-[#00a896] text-sm" /> Edit Page
                                </span>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full bg-[#f9fafb] flex flex-col items-center justify-center text-gray-400 text-xs p-4">
                            <BookOutlined className="text-2xl mb-1 text-gray-300" />
                            <span>Inside Front Cover</span>
                          </div>
                        )}
                      </div>

                      {/* Right Page */}
                      <div
                        onClick={() => {
                          if (spread.rightPage && !spread.rightPage.is_blank) {
                            handleOpenPageEditModal(spread.rightPage);
                          }
                        }}
                        className={`w-1/2 h-full relative flex flex-col group ${
                          spread.rightPage && !spread.rightPage.is_blank ? "cursor-pointer" : ""
                        }`}
                      >
                        {spread.rightPage ? (
                          spread.rightPage.is_blank ? (
                            <div className="w-full h-full bg-[#fafaf9] flex flex-col items-center justify-center text-center p-6 select-none relative">
                              <span className="text-gray-300 tracking-widest text-[11px] font-bold uppercase">
                                THIS PAGE IS LEFT BLANK
                              </span>
                            </div>
                          ) : (
                            <div className="w-full h-full relative overflow-hidden group/canvas">
                              <div className="w-full h-full transition-all duration-200 group-hover/canvas:ring-2 group-hover/canvas:ring-[#00a896]/50">
                                {renderTemplateCanvas(spread.rightPage, false)}
                              </div>
                              {/* Centered Edit Overlay with background blur & low opacity on hover */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPageEditModal(spread.rightPage);
                                }}
                                className="absolute inset-0 z-[200] flex items-center justify-center opacity-0 group-hover/canvas:opacity-100 transition-all duration-200 bg-slate-900/20 backdrop-blur-[2px] cursor-pointer"
                              >
                                <span className="bg-white/95 hover:bg-white text-gray-900 font-bold text-xs px-4 py-2 rounded-full shadow-lg border border-gray-200/90 flex items-center gap-2 transform translate-y-1 group-hover/canvas:translate-y-0 hover:scale-105 active:scale-95 transition-all">
                                  <EditOutlined className="text-[#00a896] text-sm" /> Edit Page
                                </span>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full bg-[#f9fafb] flex flex-col items-center justify-center text-gray-400 text-xs p-4">
                            <BookOutlined className="text-2xl mb-1 text-gray-300" />
                            <span>Inside Back Cover</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Page Labels Beneath Each Page (Back & Front for Cover, Page X for Interior) */}
                    <div className="w-full flex justify-between px-2 pt-2 text-xs text-gray-500 font-medium">
                      {/* Left Page Label */}
                      <div className="w-1/2 flex items-center justify-start pr-4">
                        {isCoverSpread ? (
                          <span className="text-xs text-gray-500 font-semibold">Back Cover</span>
                        ) : spread.leftPage ? (
                          <span className="text-xs text-gray-500">
                            {spread.leftPage.display_label || (spread.leftPage.page_number ? `Page ${spread.leftPage.page_number}` : "Page")}
                          </span>
                        ) : (
                          <span className="text-gray-400">Front Inside</span>
                        )}
                      </div>

                      {/* Right Page Label */}
                      <div className="w-1/2 flex items-center justify-end pl-4">
                        {isCoverSpread ? (
                          <span className="text-xs text-gray-500 font-semibold">Front Cover</span>
                        ) : spread.rightPage ? (
                          <span className="text-xs text-gray-500">
                            {spread.rightPage.display_label || (spread.rightPage.page_number ? `Page ${spread.rightPage.page_number}` : "Page")}
                          </span>
                        ) : (
                          <span className="text-gray-400">Back Inside</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* ================================================================= */}
          {/* CONTAINER 3: RIGHT CONTEXTUAL SIDEBAR (w-[320px])                 */}
          {/* ================================================================= */}
          <aside className="w-[360px] bg-white border-l border-gray-200 h-full overflow-hidden shrink-0 flex flex-col z-20 shadow-xs">
            {/* Case A: Idle State (Screenshot 3) */}
            {activeStudioTool === null && (
              <div className="h-full flex items-center justify-center p-6 text-center select-none text-gray-400 text-xs font-medium">
                Pick a tool on the left to edit your book.
              </div>
            )}

            {/* Case B: Book Size */}
            {activeStudioTool === "size" && (
              <div className="p-5 flex flex-col gap-5 select-none overflow-y-auto h-full">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Book Size</h3>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {templateSizes.length} {templateSizes.length === 1 ? "Option" : "Options"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStudioTool(null)}
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                    title="Close panel"
                  >
                    <CloseOutlined className="text-xs" />
                  </button>
                </div>

                {/* Only sizes created for the template */}
                <div className={`grid ${templateSizes.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"} gap-2.5`}>
                  {templateSizes.map((s) => {
                    const isSelected =
                      activeSizeInfo.matchedId === s.id ||
                      activeSizeInfo.name === s.name ||
                      selectedSize === s.id ||
                      selectedSize === s.name;

                    const aspect = s.width && s.height ? s.width / s.height : 1;
                    const boxHeight = 28;
                    const boxWidth = Math.max(16, Math.min(46, Math.round(boxHeight * aspect)));

                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSizeSelect(s.id)}
                        className={`relative p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                          isSelected
                            ? "border-2 border-[#f97316] text-[#f97316] bg-orange-50/40 font-semibold shadow-xs"
                            : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                        }`}
                      >
                        {s.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#00a896] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            POPULAR
                          </span>
                        )}
                        <span className="text-[9px] font-bold tracking-wider text-gray-400 uppercase mb-1.5">
                          {s.orientation}
                        </span>
                        {/* Dynamic Wireframe Box proportioned to actual width/height */}
                        <div
                          className="rounded-xs border-2 border-current mb-2 opacity-80"
                          style={{
                            width: `${boxWidth}px`,
                            height: `${boxHeight}px`,
                          }}
                        />
                        <span className="text-xs font-bold leading-tight">{s.name}</span>
                        {/* Explicit Width and Height display */}
                        <span className="text-[10px] font-semibold text-gray-700 mt-1 bg-gray-100 px-1.5 py-0.5 rounded leading-tight">
                          {s.dimensions}
                        </span>
                        <div className="flex flex-col text-[9px] text-gray-500 font-medium mt-1 leading-tight">
                          <span>W: {s.width_in || s.width} in</span>
                          <span>H: {s.height_in || s.height} in</span>
                        </div>
                        {(() => {
                          const activeEd =
                            availableEditions.find((e) => (e.edition_name || e.name) === selectedVariant) ||
                            availableEditions[0];
                          const allKnownSizes = [
                            ...(templateSizes || []),
                            ...(productData?.photobook_config?.sizes || []),
                          ];
                          const sizePrice = resolveEditionPriceForSize(activeEd, s.id, allKnownSizes);
                          if (!sizePrice) return null;
                          return (
                            <span
                              className={`text-[11px] font-bold mt-1.5 ${
                                isSelected ? "text-[#f97316]" : "text-[#00a896]"
                              }`}
                            >
                              {/* ₹{sizePrice} */}
                            </span>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Case C: Add Photos */}
            {activeStudioTool === "add" && (
              <div className="flex flex-col h-full select-none overflow-hidden">
                {/* Header Section */}
                <div className="p-4 border-b border-gray-100 flex flex-col gap-3 bg-white shrink-0 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Add Photos</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {uploadedPhotos.length} of {maxImages} uploaded •{" "}
                        <span className="text-[#00a896] font-semibold">{usedPhotoUrls.size} placed</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStudioTool(null)}
                      className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Close panel"
                    >
                      <CloseOutlined className="text-xs" />
                    </button>
                  </div>

                  {/* Actions: Upload & Autofill */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => sidebarPhotoInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex-1 bg-[#00a896] hover:bg-[#008f80] text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <UploadOutlined />
                      <span>{isUploading ? "Uploading..." : "+ Upload Photos"}</span>
                    </button>
                    {/* <button
                      type="button"
                      onClick={handleAutofillEmptySlots}
                      disabled={uploadedPhotos.length === 0 || unusedPhotosCount === 0}
                      className="bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#00a896] text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Auto-place unused photos into next empty slots"
                    >
                      <ThunderboltOutlined />
                      <span>Autofill</span>
                    </button> */}
                    <input
                      ref={sidebarPhotoInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        handleFilesSelected(e);
                        setHasUnsavedChanges(true);
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setPhotoFilter("all")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        photoFilter === "all"
                          ? "bg-white text-gray-900 font-bold shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      All ({uploadedPhotos.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoFilter("unused")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        photoFilter === "unused"
                          ? "bg-white text-[#00a896] font-bold shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Unused ({unusedPhotosCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoFilter("placed")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                        photoFilter === "placed"
                          ? "bg-white text-teal-800 font-bold shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      Placed ({usedPhotoUrls.size})
                    </button>
                  </div>

                  {/* Hint */}
                  {/* <div className="bg-teal-50/60 rounded-xl p-2 border border-teal-100 text-[11px] text-teal-800 flex items-center gap-1.5">
                    <InfoCircleOutlined className="text-teal-600 shrink-0" />
                    <span className="truncate">
                      Click any photo to place into next open frame.
                    </span>
                  </div> */}

                  {/* Upload Progress Bar if uploading */}
                  {isUploading && (
                    <div className="bg-teal-50/70 p-2.5 rounded-xl border border-teal-100 flex flex-col gap-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-teal-800 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Spin size="small" /> Uploading photos...
                        </span>
                        <span className="font-bold text-teal-700">{uploadPercent}%</span>
                      </div>
                      <Progress percent={uploadPercent} showInfo={false} strokeColor="#00a896" size="small" />
                    </div>
                  )}
                </div>

                {/* Photos Grid Container with guaranteed CSS grid sizing */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                  {filteredPhotos.length === 0 ? (
                    <div
                      onClick={() => sidebarPhotoInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-[#00a896] hover:bg-teal-50/20 rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group mt-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00a896] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        <UploadOutlined />
                      </div>
                      <span className="text-xs font-bold text-gray-700 group-hover:text-[#00a896]">
                        {photoFilter === "unused"
                          ? "All photos have been placed!"
                          : photoFilter === "placed"
                          ? "No photos placed yet"
                          : "Click to Browse Photos"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {photoFilter === "all" ? "JPG, PNG, WebP supported" : "Switch tabs or upload more photos"}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gridAutoRows: "135px",
                        gap: "12px",
                        alignContent: "start",
                      }}
                      className="pb-6"
                    >
                      {filteredPhotos.map((p, idx) => {
                        const isUsed = usedPhotoUrls.has(p.url);
                        return (
                          <div
                            key={p.id || `photo-${idx}-${p.url}`}
                            onClick={() => handleAssignPhotoToPage(p)}
                            style={{
                              width: "100%",
                              height: "135px",
                              minHeight: "135px",
                              maxHeight: "135px",
                              position: "relative",
                              borderRadius: "12px",
                              overflow: "hidden",
                            }}
                            className={`group border cursor-pointer select-none transition-all duration-200 bg-gray-100 ${
                              isUsed
                                ? "border-teal-300 ring-1 ring-teal-200/50 shadow-2xs"
                                : "border-gray-200 hover:border-[#00a896] hover:shadow-md"
                            }`}
                            title={isUsed ? "Photo placed • Click to place again" : "Click to place into book page"}
                          >
                            <img
                              src={p.url}
                              alt={p.name || `Photo ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                              className="group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />

                            {/* Top-Left: Index Badge */}
                            <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
                              <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                #{idx + 1}
                              </span>
                            </div>

                            {/* Top-Right: Status Badge */}
                            <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
                              {isUsed ? (
                                <span className="bg-[#00a896] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                  ✓ Placed
                                </span>
                              ) : (
                                <span className="bg-white/90 text-gray-700 text-[8px] font-medium px-1.5 py-0.5 rounded shadow-xs border border-gray-200">
                                  Unused
                                </span>
                              )}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 z-10">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewModalUrl(p.url);
                                  }}
                                  className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center text-xs shadow-xs transition-transform active:scale-95"
                                  title="Preview"
                                >
                                  <EyeOutlined />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhoto(p.id);
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xs shadow-xs transition-transform active:scale-95"
                                  title="Delete"
                                >
                                  <DeleteOutlined />
                                </button>
                              </div>
                              <div className="text-center">
                                <span className="inline-block bg-[#00a896] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                  {isUsed ? "Place Again" : "+ Add to Page"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Case D: Arrange Spreads */}
            {activeStudioTool === "arrange" && (
              <div className="p-4 sm:p-5 flex flex-col gap-4 select-none overflow-y-auto h-full">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Arrange Pages</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Drag pages to rearrange sequence. Covers remain fixed in place.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStudioTool(null)}
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                    title="Close panel"
                  >
                    <CloseOutlined className="text-xs" />
                  </button>
                </div>

                {/* Fixed Front Cover Card */}
                {(() => {
                  const frontCover = pagesData.find(
                    (p) => p.page_type === "front_cover" || p.page_id === "front-cover"
                  );
                  const frontFrameCount = (frontCover?.elements || []).filter(
                    (el) => el.type === "photo_frame"
                  ).length;
                  return (
                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                          <LockOutlined className="text-xs" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            Front Cover
                            <span className="text-[9px] bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.2 rounded-full uppercase">
                              Fixed
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {frontFrameCount} Photo Slot{frontFrameCount === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Page 1</span>
                    </div>
                  );
                })()}

                {/* Reorderable Interior Pages List */}
                <div className="flex flex-col gap-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
                  {(() => {
                    const interiorPages = pagesData.filter(
                      (p) =>
                        p.page_type !== "front_cover" &&
                        p.page_id !== "front-cover" &&
                        p.page_type !== "back_cover" &&
                        p.page_id !== "back-cover" &&
                        !p.is_blank &&
                        p.page_id !== "blank-inside-front" &&
                        p.page_id !== "blank-inside-back" &&
                        p.page_type !== "blank"
                    );

                    return interiorPages.map((pg, idx) => {
                      const frameCount = (pg.elements || []).filter(
                        (el) => el.type === "photo_frame"
                      ).length;
                      const placedCount = (pg.elements || []).filter(
                        (el) => el.type === "photo_frame" && el.photo_url
                      ).length;
                      const isDragging = draggedArrangeIndex === idx;
                      const isDragOver = dragOverArrangeIndex === idx;

                      return (
                        <div
                          key={pg.page_id || idx}
                          draggable
                          onDragStart={() => setDraggedArrangeIndex(idx)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverArrangeIndex !== idx) setDragOverArrangeIndex(idx);
                          }}
                          onDragEnd={() => {
                            setDraggedArrangeIndex(null);
                            setDragOverArrangeIndex(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedArrangeIndex !== null && draggedArrangeIndex !== idx) {
                              handleReorderInteriorPages(draggedArrangeIndex, idx);
                            }
                            setDraggedArrangeIndex(null);
                            setDragOverArrangeIndex(null);
                          }}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-grab active:cursor-grabbing select-none ${
                            isDragging
                              ? "opacity-40 border-dashed border-[#00a896] bg-teal-50/20"
                              : isDragOver
                              ? "border-2 border-[#00a896] bg-teal-50/40 shadow-xs scale-[1.01]"
                              : "border-gray-200 hover:border-gray-300 bg-white shadow-2xs hover:shadow-xs"
                          }`}
                        >
                          {/* Drag Handle & Info */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="text-gray-400 group-hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing">
                              <HolderOutlined className="text-sm" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {pg.page_number}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-gray-800 text-xs truncate">
                                {pg.display_label || `Page ${pg.page_number}`}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                                <span>{frameCount} slot{frameCount === 1 ? "" : "s"}</span>
                                {placedCount > 0 && (
                                  <span className="text-[#00a896] font-semibold">
                                    • {placedCount} filled
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Up / Down Arrow Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveInteriorPage(idx, -1);
                              }}
                              disabled={idx === 0}
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                                idx === 0
                                  ? "text-gray-200 cursor-not-allowed"
                                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
                              }`}
                              title="Move Up"
                            >
                              <ArrowUpOutlined />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveInteriorPage(idx, 1);
                              }}
                              disabled={idx === interiorPages.length - 1}
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-colors ${
                                idx === interiorPages.length - 1
                                  ? "text-gray-200 cursor-not-allowed"
                                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
                              }`}
                              title="Move Down"
                            >
                              <ArrowDownOutlined />
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Fixed Back Cover Card */}
                {(() => {
                  const backCover = pagesData.find(
                    (p) => p.page_type === "back_cover" || p.page_id === "back-cover"
                  );
                  const backFrameCount = (backCover?.elements || []).filter(
                    (el) => el.type === "photo_frame"
                  ).length;
                  return (
                    <div className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                          <LockOutlined className="text-xs" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            Back Cover
                            <span className="text-[9px] bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.2 rounded-full uppercase">
                              Fixed
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {backFrameCount} Photo Slot{backFrameCount === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">Last Page</span>
                    </div>
                  );
                })()}

                {/* Density Preset Quick Option */}
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block mb-1.5">
                    Density Presets
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "template", label: "Template" },
                      { id: "1", label: "1/Page" },
                      { id: "2", label: "2/Page" },
                      { id: "3", label: "3/Page" },
                      { id: "4", label: "4/Page" },
                      { id: "mixed", label: "Mixed" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setPhotosPerPageMode(mode.id);
                          syncPhotosToPages(uploadedPhotos, mode.id);
                          message.success(`Set layout to ${mode.label}`);
                        }}
                        className={`py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          photosPerPageMode === mode.id
                            ? "bg-[#00a896] text-white shadow-2xs"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Case E: Design Themes */}
            {activeStudioTool === "design" && (
              <div className="p-4 sm:p-5 flex flex-col gap-4 select-none h-full overflow-y-auto styled-scrollbar">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Theme Design</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Select a published theme. Your photos and pages adapt automatically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveStudioTool(null)}
                    className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                    title="Close panel"
                  >
                    <CloseOutlined className="text-xs" />
                  </button>
                </div>

                <div className="flex flex-col gap-3.5 pb-6">
                  {availableTemplates.map((tpl) => {
                    const isSelected =
                      (selectedTemplateName && (selectedTemplateName === tpl.template_name || selectedTemplateName.trim().toLowerCase() === String(tpl.template_name || "").trim().toLowerCase())) ||
                      (templateData && (
                        String(templateData._id || "") === String(tpl._id || "") ||
                        String(templateData.template_id || "").toLowerCase() === String(tpl.template_id || "").toLowerCase() ||
                        String(templateData.template_id || "").toLowerCase() === String(tpl._id || "").toLowerCase()
                      )) ||
                      (selectedTemplateId && (
                        String(selectedTemplateId) === String(tpl._id || "") ||
                        String(selectedTemplateId).toLowerCase() === String(tpl.template_id || "").toLowerCase()
                      ));

                    const frontPage =
                      (tpl.pages || []).find((p) => p.page_type === "front_cover") ||
                      (tpl.published_snapshot?.pages || []).find((p) => p.page_type === "front_cover") ||
                      (tpl.pages || [])[0];

                    const coverBg = frontPage?.background || { type: "color", value: "#1e1e2d" };
                    const coverImageUrl =
                      tpl.thumbnail_url ||
                      tpl.cover_image ||
                      tpl.cover_image_url ||
                      (coverBg.type === "image" ? coverBg.value : null);

                    const bgStyle =
                      coverBg.type === "gradient" && coverBg.gradient
                        ? { background: coverBg.gradient }
                        : coverBg.type === "image" && coverBg.value
                        ? { backgroundImage: `url(${coverBg.value})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : { backgroundColor: coverBg.value || "#1e1e2d" };

                    return (
                      <div
                        key={tpl._id || tpl.template_id || tpl.template_name}
                        onClick={() => {
                          const tplId = tpl.template_id || tpl._id || tpl.slug;
                          setSelectedTemplateName(tpl.template_name);
                          if (tplId) setSelectedTemplateId(tplId);
                          setTemplateData(tpl);

                          // Resolve the matching product template configuration
                          const productTemplates = productData?.photobook_config?.templates || [];
                          const cleanTplName = String(tpl.template_name || "").trim().toLowerCase();
                          const cleanTplId = String(tpl.template_id || tpl._id || tpl.slug || "").trim().toLowerCase();
                          const matchedProductTemplate = productTemplates.find(
                            (pt) =>
                              (pt._id && String(pt._id).trim().toLowerCase() === cleanTplId) ||
                              (pt.slug && String(pt.slug).trim().toLowerCase() === cleanTplId) ||
                              (pt.template_id && String(pt.template_id).trim().toLowerCase() === cleanTplId) ||
                              (pt.template_name && String(pt.template_name).trim().toLowerCase() === cleanTplName)
                          );

                          // Reconcile edition if new template has specific editions
                          const tplEditions =
                            (matchedProductTemplate?.editions && matchedProductTemplate.editions.length > 0
                              ? matchedProductTemplate.editions
                              : null) ||
                            (tpl.editions && tpl.editions.length > 0 ? tpl.editions : null) ||
                            productData?.photobook_config?.editions ||
                            [];

                          let reconciledVariant = selectedVariant;
                          if (tplEditions.length > 0) {
                            const curVar = String(selectedVariant || "").trim().toLowerCase();
                            const stillValid = tplEditions.some(
                              (e) =>
                                (e.edition_name && String(e.edition_name).trim().toLowerCase() === curVar) ||
                                (e.name && String(e.name).trim().toLowerCase() === curVar)
                            );
                            if (!stillValid) {
                              reconciledVariant = tplEditions[0].edition_name || tplEditions[0].name;
                              setSelectedVariant(reconciledVariant);
                            }
                          }

                          // Re-clamp or adjust photoBookPages to the new template's min/max pages
                          const minP = Number(
                            matchedProductTemplate?.min_pages ||
                            tpl.min_pages ||
                            tpl.page_config?.min_pages ||
                            productData?.photobook_config?.min_pages ||
                            10
                          );
                          const maxP = Number(
                            matchedProductTemplate?.max_pages ||
                            tpl.max_pages ||
                            tpl.page_config?.max_pages ||
                            productData?.photobook_config?.max_pages ||
                            60
                          );
                          let targetPages = photoBookPages;
                          if (targetPages < minP) targetPages = minP;
                          else if (targetPages > maxP) targetPages = maxP;
                          setPhotoBookPages(targetPages);

                          setDesignData((prev) => ({
                            ...(prev || {}),
                            template_id: tplId,
                            template_name: tpl.template_name,
                            variant: reconciledVariant,
                            pages_count: targetPages,
                          }));

                          const rebuilt = buildPagesFromTemplate(targetPages, tpl, uploadedPhotos);
                          setPagesData(rebuilt);
                          setHasUnsavedChanges(true);
                          message.success(`Applied ${tpl.template_name} theme`);
                        }}
                        className={`rounded-2xl border overflow-hidden cursor-pointer transition-all flex flex-col group shrink-0 ${
                          isSelected
                            ? "border-2 border-[#00a896] shadow-md ring-2 ring-teal-500/10"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                        }`}
                      >
                        {/* Visual Cover Preview Thumbnail */}
                        <div
                          className="h-36 shrink-0 relative overflow-hidden flex flex-col items-center justify-center p-3 text-center transition-transform group-hover:scale-[1.01]"
                          style={bgStyle}
                        >
                          {coverImageUrl ? (
                            <img
                              src={coverImageUrl}
                              alt={tpl.template_name}
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : null}

                          {/* Dark overlay for contrast */}
                          <div className="absolute inset-0 bg-black/25 pointer-events-none" />

                          {/* Cover Typography */}
                          <div className="relative z-10 px-3 py-2 bg-black/40 backdrop-blur-xs rounded-xl max-w-[85%] border border-white/20">
                            <span className="text-white text-xs font-bold tracking-wide block truncate">
                              {tpl.template_name}
                            </span>
                            <span className="text-white/80 text-[10px] tracking-wider uppercase block mt-0.5">
                              {tpl.category || "Photobook"} Edition
                            </span>
                          </div>

                          {/* Active Pill Badge */}
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 z-20">
                              <span className="bg-[#00a896] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <CheckOutlined /> Active
                              </span>
                            </div>
                          )}

                          {/* Blank Page Status Chip */}
                          <div className="absolute bottom-2 left-2 z-20">
                            <span className="bg-black/50 text-white/90 text-[8px] font-medium px-1.5 py-0.5 rounded backdrop-blur-xs">
                              {Boolean(tpl.include_blank_page || tpl.page_config?.include_blank_page)
                                ? "Blank Page Enabled"
                                : "Continuous Pages"}
                            </span>
                          </div>
                        </div>

                        {/* Card Info Section */}
                        <div className="p-3 bg-white flex items-center justify-between">
                          <div>
                            <div className="font-bold text-xs text-gray-900 group-hover:text-[#00a896] transition-colors">
                              {tpl.template_name}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {tpl.category || "General"} • {tpl.pages?.length || 20} Pages Configured
                            </div>
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                              isSelected
                                ? "bg-teal-50 text-teal-700 font-bold"
                                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                            }`}
                          >
                            {isSelected ? "Selected" : "Use Theme"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Case F: Book Options */}
            {activeStudioTool === "options" && (() => {
              // Extract bounds and pricing strictly from real template / edition data via priceDetails
              const activeEditionObj =
                availableEditions.find(
                  (e) => (e.edition_name || e.name) === selectedVariant
                ) || availableEditions[0];

              const minPages = Number(
                priceDetails.minPages ||
                activeEditionObj?.min_pages ||
                templateData?.min_pages ||
                templateData?.page_config?.min_pages ||
                productData?.photobook_config?.min_pages ||
                10
              );
              const maxPages = Number(
                priceDetails.maxPages ||
                activeEditionObj?.max_pages ||
                templateData?.max_pages ||
                templateData?.page_config?.max_pages ||
                productData?.photobook_config?.max_pages ||
                60
              );
              const basePages = Number(
                priceDetails.basePages ||
                activeEditionObj?.default_pages ||
                templateData?.default_pages ||
                templateData?.page_config?.default_pages ||
                productData?.photobook_config?.default_pages ||
                20
              );
              const pricePerExtraPage = Number(
                priceDetails.extraPricePerUnit ??
                activeEditionObj?.price_per_extra_page ??
                templateData?.price_per_extra_page ??
                templateData?.page_config?.price_per_extra_page ??
                productData?.photobook_config?.price_per_extra_page ??
                15
              );

              // Quick select page chips strictly bounded by real min and max
              const standardSteps = [10, 16, 20, 26, 32, 40, 50, 60];
              const quickPageList = Array.from(
                new Set([minPages, ...standardSteps.filter((n) => n >= minPages && n <= maxPages), maxPages])
              ).sort((a, b) => a - b);

              const handleUpdatePageCount = (newPageCount) => {
                const clamped = Math.max(minPages, Math.min(maxPages, newPageCount));
                if (clamped === photoBookPages) return;
                setPhotoBookPages(clamped);

                // Identify covers, blanks, and existing interior pages
                const frontCover = pagesData.find(
                  (p) => p.page_type === "front_cover" || p.page_id === "front-cover"
                ) || pagesData[0];
                const blankInsideFront = pagesData.find((p) => p.page_id === "blank-inside-front");
                const blankInsideBack = pagesData.find((p) => p.page_id === "blank-inside-back");
                const backCover = pagesData.find(
                  (p) => p.page_type === "back_cover" || p.page_id === "back-cover"
                ) || pagesData[pagesData.length - 1];

                const existingInterior = pagesData.filter((p) => {
                  if (p.page_type === "front_cover" || p.page_id === "front-cover") return false;
                  if (p.page_type === "back_cover" || p.page_id === "back-cover") return false;
                  if (p.page_id === "blank-inside-front" || p.page_id === "blank-inside-back") return false;
                  if (p.is_blank) return false;
                  return true;
                });

                const targetInteriorCount = Math.max(2, clamped - 2);
                const currentInteriorCount = existingInterior.length;

                let nextInterior = [...existingInterior];

                if (targetInteriorCount > currentInteriorCount) {
                  // Only ADD the newly required pages; PRESERVE all existing edited interior pages
                  const usedUrls = new Set();
                  pagesData.forEach((pg) => {
                    (pg.elements || []).forEach((el) => {
                      if (el.type === "photo_frame" && el.photo_url) {
                        usedUrls.add(el.photo_url);
                      }
                    });
                  });
                  const unusedPhotos = uploadedPhotos.filter((p) => !usedUrls.has(p.url));
                  let unusedIdx = 0;
                  const getNextPhoto = () => {
                    if (unusedIdx < unusedPhotos.length) {
                      return unusedPhotos[unusedIdx++];
                    }
                    return null;
                  };

                  const activeTpl = templateData || DEFAULT_VINTAGE_TEMPLATE;
                  const dbDecDefs = extractDatabaseDecorations(activeTpl);

                  for (let pNum = currentInteriorCount + 1; pNum <= targetInteriorCount; pNum++) {
                    const tplPage = resolveTemplatePage(pNum, targetInteriorCount, activeTpl);
                    const clonedElements = (tplPage?.elements || []).map((el) => {
                      if (el.type === "photo_frame") {
                        const assignedPhoto = getNextPhoto();
                        return {
                          ...el,
                          photo_url: assignedPhoto ? assignedPhoto.url : (el.photo_url || ""),
                          photo_id: assignedPhoto ? assignedPhoto.id : (el.photo_id || ""),
                          test_image_url: el.test_image_url || el.sample_image_url || "",
                          crop: el.crop || { zoom: 1, offsetX: 0, offsetY: 0 },
                          rotation: el.rotation || 0,
                        };
                      }
                      if (el.type === "decoration") {
                        return resolveDbDecorationData(el, dbDecDefs);
                      }
                      return { ...el };
                    });

                    const interiorRawList = clonedElements.length > 0 ? clonedElements : [
                      {
                        id: `p${pNum}-frame-1`,
                        frame_id: `p${pNum}_frame_1`,
                        type: "photo_frame",
                        x: 60,
                        y: 80,
                        width: 420,
                        height: 840,
                        x_pct: 6,
                        y_pct: 8,
                        width_pct: 42,
                        height_pct: 84,
                        unit: "%",
                        is_percentage: true,
                        rotation: 0,
                        shape: "rectangle",
                        fit_mode: "cover",
                        photo_url: getNextPhoto()?.url || "",
                        test_image_url: "",
                      },
                      {
                        id: `p${pNum}-frame-2`,
                        frame_id: `p${pNum}_frame_2`,
                        type: "photo_frame",
                        x: 520,
                        y: 80,
                        width: 420,
                        height: 840,
                        x_pct: 52,
                        y_pct: 8,
                        width_pct: 42,
                        height_pct: 84,
                        unit: "%",
                        is_percentage: true,
                        rotation: 0,
                        shape: "rectangle",
                        fit_mode: "cover",
                        photo_url: getNextPhoto()?.url || "",
                        test_image_url: "",
                      },
                    ];

                    nextInterior.push({
                      page_number: pNum,
                      display_label: `Page ${pNum}`,
                      page_id: `page-${pNum}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                      name: `Page ${pNum}`,
                      page_type: "interior",
                      background: tplPage?.background || { type: "color", value: "#ffffff", opacity: 1 },
                      elements: interiorRawList.map(normalizeElementToPaperCoords),
                    });
                  }
                } else if (targetInteriorCount < currentInteriorCount) {
                  // Only remove trailing interior pages; PRESERVE all existing edited pages up to the target
                  nextInterior = nextInterior.slice(0, targetInteriorCount);
                }

                // Renumber display labels cleanly
                const renumberedInterior = nextInterior.map((pg, idx) => ({
                  ...pg,
                  page_number: idx + 1,
                  display_label: `Page ${idx + 1}`,
                  name: `Page ${idx + 1}`,
                }));

                const finalPages = [
                  frontCover,
                  ...(blankInsideFront ? [blankInsideFront] : []),
                  ...renumberedInterior,
                  ...(blankInsideBack ? [blankInsideBack] : []),
                  backCover,
                ].filter(Boolean);

                setPagesData(finalPages);
                setHasUnsavedChanges(true);
                message.success(`Updated book to ${clamped} pages`);
              };

              const extraPages = priceDetails.extraPages ?? Math.max(0, photoBookPages - basePages);
              const extraPagesCost = priceDetails.extraPagesCost ?? (extraPages * pricePerExtraPage);
              const editionSurcharge =
                availableEditions.find((e) => (e.edition_name || e.name) === selectedVariant)?.surcharge || 0;

              const liveTotal =
                priceDetails.finalTotal ||
                ((Number(priceDetails.basePrice) || 1499) + extraPagesCost + editionSurcharge);

              return (
                <div className="flex flex-col h-full select-none overflow-hidden">
                  {/* Sticky Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 shadow-2xs">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Book Options</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Real template specifications, page range & finishes
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStudioTool(null)}
                      className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Close panel"
                    >
                      <CloseOutlined className="text-xs" />
                    </button>
                  </div>

                  {/* Scrollable Options Body */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                    {/* 1. Edition (Rendered only if real editions exist in template data) */}
                    {availableEditions.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-baseline gap-1.5">
                            <label className="text-xs font-bold text-gray-800">Book Edition</label>
                            <span className="text-[10px] text-gray-400 font-medium">
                              for {activeSizeInfo?.dimensions || activeSizeInfo?.name || "Selected Size"}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#00a896] font-semibold">
                            {selectedVariant || availableEditions[0]?.edition_name || availableEditions[0]?.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {availableEditions.map((ed) => {
                            const isChosen =
                              selectedVariant === (ed.edition_name || ed.name) ||
                              (!selectedVariant && ed === availableEditions[0]);

                            const allKnownSizes = [
                              ...(templateSizes || []),
                              ...(productData?.photobook_config?.sizes || []),
                            ];
                            const activeSizeIdentifier =
                              selectedSize ||
                              activeSizeInfo?.id ||
                              activeSizeInfo?.matchedId ||
                              activeSizeInfo?.name ||
                              designData?.size ||
                              "8x8";

                            const edPricing = getEditionPricingDetailsForSize(
                              ed,
                              activeSizeIdentifier,
                              allKnownSizes
                            );
                            const edPriceVal = edPricing?.customerPrice;
                            const edMrpVal = edPricing?.mrp;

                            return (
                              <div
                                key={ed._id || ed.edition_name || ed.name}
                                onClick={() => {
                                  setSelectedVariant(ed.edition_name || ed.name);
                                  setHasUnsavedChanges(true);
                                }}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  isChosen
                                    ? "border-[#00a896] bg-teal-50/50 shadow-2xs font-semibold ring-1 ring-teal-200"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                              >
                                <div className="pr-2">
                                  <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                    {isChosen && <CheckOutlined className="text-[#00a896] text-xs" />}
                                    <span>{ed.edition_name || ed.name}</span>
                                  </div>
                                  {ed.description && (
                                    <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                                      {ed.description}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  {edPriceVal !== null && edPriceVal !== undefined ? (
                                    <div className="flex items-baseline gap-1.5 justify-end">
                                      {edMrpVal && edMrpVal > edPriceVal && (
                                        <span className="text-[10px] text-gray-400 line-through">
                                          ₹{edMrpVal}
                                        </span>
                                      )}
                                      <span
                                        className={`text-xs font-bold ${
                                          isChosen ? "text-[#00a896]" : "text-gray-700"
                                        }`}
                                      >
                                        ₹{edPriceVal}
                                      </span>
                                    </div>
                                  ) : ed.price_tag ? (
                                    <span
                                      className={`text-[11px] font-bold ${
                                        isChosen ? "text-[#00a896]" : "text-gray-500"
                                      }`}
                                    >
                                      {ed.price_tag}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Selected Template</span>
                          <span className="text-xs font-bold text-gray-800">{selectedTemplateName || templateData?.template_name || "Photo Book"}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#00a896] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                          Standard Edition
                        </span>
                      </div>
                    )}

                    {/* 2. Page Range Selection (Slider + Range Stepper + Chips, NO price tags on buttons) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <label className="text-xs font-bold text-gray-800 block">Number of Pages</label>
                          <span className="text-[10px] text-gray-400">
                            Allowed range: {minPages} – {maxPages} pages
                          </span>
                        </div>
                        <span className="text-sm font-bold text-[#00a896] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {photoBookPages} Pages
                        </span>
                      </div>

                      {/* Interactive Range Slider with Real Template Min, Base, Max marks */}
                      <div className="px-2 pt-2 pb-1">
                        <Slider
                          min={minPages}
                          max={maxPages}
                          step={2}
                          value={photoBookPages}
                          onChange={(val) => handleUpdatePageCount(val)}
                          tooltip={{ formatter: (val) => `${val} Pages` }}
                          marks={{
                            [minPages]: {
                              style: { fontSize: "10px", color: "#64748b", fontWeight: "600" },
                              label: `${minPages}p`,
                            },
                            [basePages]: {
                              style: { fontSize: "10px", color: "#00a896", fontWeight: "bold" },
                              label: `${basePages}p`,
                            },
                            [maxPages]: {
                              style: { fontSize: "10px", color: "#64748b", fontWeight: "600" },
                              label: `${maxPages}p`,
                            },
                          }}
                        />
                      </div>

                      {/* Page Config Info Pill */}
                      <div className="text-[11px] text-gray-600 mt-4 flex items-center justify-between bg-teal-50/70 p-3 rounded-xl border border-teal-100">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{photoBookPages} Pages Configured</span>
                          <span className="text-[10px] text-gray-500">
                            {photoBookPages === basePages
                              ? `Standard included pages (${basePages}p)`
                              : photoBookPages > basePages
                              ? `+${photoBookPages - basePages} extra pages added`
                              : `${basePages - photoBookPages} pages below base`}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-[#00a896]">₹{pricePerExtraPage}/extra page</span>
                      </div>
                    </div>

                  </div>

                  {/* 3. Bottom Sticky Pricing Details */}
                  <div className="p-4 border-t border-gray-200 bg-white shrink-0 shadow-lg">
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Base Photobook ({basePages} pages)</span>
                        <span>₹{priceDetails.basePrice || 1499}</span>
                      </div>

                      {extraPages > 0 && (
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Extra {extraPages} Pages (₹{pricePerExtraPage}/p)</span>
                          <span className="text-[#00a896] font-semibold">
                            + ₹{extraPagesCost}
                          </span>
                        </div>
                      )}

                      {editionSurcharge > 0 && (
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>{selectedVariant}</span>
                          <span className="text-[#00a896] font-semibold">+ ₹{editionSurcharge}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-800">Total Price</span>
                        <span className="text-lg font-bold text-[#00a896]">
                          ₹{liveTotal}
                        </span>
                      </div>

                      <div className="pt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                        <SafetyCertificateOutlined className="text-[#00a896]" />
                        <span>100% Quality & Print Guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </aside>
        </div>
      )}

      {/* ── Photo Preview Modal (Eye button click on uploaded photo) ───────── */}
      <Modal
        open={Boolean(previewModalUrl)}
        onCancel={() => setPreviewModalUrl(null)}
        footer={null}
        centered
        width={750}
        className="!p-0 overflow-hidden"
      >
        {previewModalUrl && (
          <div className="p-2 bg-black rounded-lg flex items-center justify-center">
            <img
              src={previewModalUrl}
              alt="Preview"
              className="max-h-[80vh] max-w-full object-contain rounded"
            />
          </div>
        )}
      </Modal>

      {/* ── Realistic Photobook Flip Preview Modal (Front, Spreads, Back) ─── */}
      <Modal
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={null}
        centered
        width={980}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <RealisticBookPreview
          steps={previewSteps}
          currentStepIndex={previewSpreadModalIndex}
          onStepChange={setPreviewSpreadModalIndex}
          renderCanvas={renderTemplateCanvas}
          onClose={() => setIsPreviewModalOpen(false)}
          sizeInfo={activeSizeInfo}
          availableSizes={templateSizes}
          onSelectSize={handleSizeSelect}
        />
      </Modal>

      {/* ── Page Customization Modal (Printshoppy Theme) ───────────────────── */}
      <Modal
        open={editingModalOpen}
        onCancel={() => setEditingModalOpen(false)}
        footer={null}
        centered
        width={820}
        closeIcon={null}
        className="photobook-page-edit-modal"
        styles={{ body: { padding: 0, borderRadius: "0px", overflow: "visible" } }}
      >
        {editingPageDraft && (() => {
          const draftFrames = (editingPageDraft.elements || []).filter((el) => el.type === "photo_frame");
          const draftTexts = (editingPageDraft.elements || []).filter((el) => el.type === "text");
          const draftDecorations = (editingPageDraft.elements || []).filter((el) => el.type === "decoration");
          const pageTitle = editingPageDraft.display_label || (editingPageDraft.page_number ? `Page ${editingPageDraft.page_number}` : "Page");
          const isCoverPage = Boolean(
            editingPageDraft.page_type === "cover" ||
            editingPageDraft.page_type === "front_cover" ||
            editingPageDraft.page_type === "back_cover" ||
            editingPageDraft.page_id === "front-cover" ||
            editingPageDraft.page_id === "back-cover" ||
            editingPageDraft.display_label?.toLowerCase().includes("cover") ||
            editingPageDraft.page_number === "Front" ||
            editingPageDraft.page_number === "Back"
          );

          // ── CASE 1: "PAGE TEXT" SUB-VIEW ──────────────────────────────────
          if (modalSubView === "text") {
            return (
              <div className="bg-white flex flex-col rounded-none overflow-hidden select-none">
                {/* 1. Page Text Modal Header */}
                <div className="h-14 px-5 border-b border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCancelTextDraft}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer"
                  >
                    <LeftOutlined className="text-xs" />
                    <span>Back to Page</span>
                  </button>

                  <span className="text-sm font-bold text-gray-800">
                    Page Text
                  </span>

                  <button
                    type="button"
                    onClick={handleCancelTextDraft}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                    title="Close"
                  >
                    <CloseOutlined className="text-sm" />
                  </button>
                </div>

                {/* 2. Page Text Form Body */}
                <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
                  {/* A. Live Text Preview Card (Dynamic Black/White Contrast Background) */}
                  {(() => {
                    const isWhiteFamily = isWhiteFamilyColor(textFormDraft.color);
                    return (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Preview
                          </label>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {isWhiteFamily ? "Dark contrast mode active" : "Light contrast mode active"}
                          </span>
                        </div>
                        <div
                          className={`w-full min-h-[96px] p-4 rounded-xl border flex items-center justify-center shadow-inner overflow-hidden transition-colors duration-200 ${
                            isWhiteFamily ? "bg-slate-950 border-slate-800" : "bg-white border-gray-200"
                          }`}
                          style={{
                            backgroundColor: isWhiteFamily ? "#0a0f1d" : "#ffffff",
                            textAlign: textFormDraft.align || "center",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: getFontFamilyFallback(textFormDraft.font_family || "Playfair Display"),
                              fontSize: `${Math.max(14, Math.min(48, Number(textFormDraft.font_size) || 28))}px`,
                              color: textFormDraft.color || (isWhiteFamily ? "#ffffff" : "#1e293b"),
                              textAlign: textFormDraft.align || "center",
                              lineHeight: 1.25,
                              wordBreak: "break-word",
                            }}
                          >
                            {textFormDraft.content || (
                              <span
                                className={`italic font-sans text-sm ${
                                  isWhiteFamily ? "text-slate-500" : "text-gray-300"
                                }`}
                              >
                                (Type text below to see live preview)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* B. Text Input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">
                        Type your text <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {textFormDraft.content.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={textFormDraft.content}
                      onChange={(e) => setTextFormDraft((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder="e.g. Summer Memories, Goa Trip 2024, With Love..."
                      className="w-full p-3 text-sm text-gray-800 bg-gray-50/50 border border-gray-300 rounded-xl focus:border-[#00a896] focus:bg-white focus:ring-2 focus:ring-[#00a896]/20 outline-none transition-all resize-none shadow-2xs"
                      autoFocus
                    />
                  </div>

                  {/* C. Font Family Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Choose Font
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AVAILABLE_FONTS.map((f) => {
                        const isSelected = textFormDraft.font_family === f.name;
                        return (
                          <button
                            key={f.name}
                            type="button"
                            onClick={() => setTextFormDraft((prev) => ({ ...prev, font_family: f.name }))}
                            style={{ fontFamily: getFontFamilyFallback(f.name) }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col ${
                              isSelected
                                ? "border-2 border-[#00a896] bg-[#00a896]/10 text-[#00a896] font-bold shadow-xs"
                                : "border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="text-base truncate">{f.name}</span>
                            <span className="text-[10px] text-gray-400 font-sans font-normal truncate">
                              {f.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* D. Font Size & Alignment Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Font Size */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700">Font Size</label>
                        <span className="text-xs font-mono font-bold text-[#00a896] bg-[#00a896]/10 px-2 py-0.5 rounded-md">
                          {textFormDraft.font_size}px
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setTextFormDraft((prev) => ({
                              ...prev,
                              font_size: Math.max(14, (Number(prev.font_size) || 28) - 2),
                            }))
                          }
                          className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min={14}
                          max={72}
                          step={2}
                          value={textFormDraft.font_size}
                          onChange={(e) =>
                            setTextFormDraft((prev) => ({ ...prev, font_size: Number(e.target.value) }))
                          }
                          className="flex-1 accent-[#00a896] cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setTextFormDraft((prev) => ({
                              ...prev,
                              font_size: Math.min(72, (Number(prev.font_size) || 28) + 2),
                            }))
                          }
                          className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Alignment */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-700">Alignment</label>
                      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                        {[
                          { val: "left", label: "Left" },
                          { val: "center", label: "Center" },
                          { val: "right", label: "Right" },
                        ].map(({ val, label }) => {
                          const isSelected = (textFormDraft.align || "center") === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setTextFormDraft((prev) => ({ ...prev, align: val }))}
                              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-white text-gray-900 shadow-xs"
                                  : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* E. Text Color Picker */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">Text Color</label>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: textFormDraft.color }}
                        />
                        <span className="text-xs font-mono text-gray-500 uppercase">
                          {textFormDraft.color}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {AVAILABLE_COLORS.map((c) => {
                        const isSelected = textFormDraft.color?.toLowerCase() === c.value.toLowerCase();
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setTextFormDraft((prev) => ({ ...prev, color: c.value }))}
                            style={{ backgroundColor: c.value }}
                            className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative shadow-xs ${
                              isSelected ? "scale-125 ring-2 ring-offset-2 ring-[#00a896]" : "hover:scale-110"
                            } ${c.value === "#ffffff" ? "border border-gray-300" : ""}`}
                            title={c.label}
                          />
                        );
                      })}
                      {/* Custom Color Input */}
                      <label
                        className="w-7 h-7 rounded-full border border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
                        title="Custom Color"
                      >
                        <input
                          type="color"
                          value={textFormDraft.color || "#000000"}
                          onChange={(e) => setTextFormDraft((prev) => ({ ...prev, color: e.target.value }))}
                          className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                        />
                        <span className="text-[10px] text-gray-500 font-bold">🎨</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. Page Text Footer */}
                <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-white">
                  <button
                    type="button"
                    onClick={handleCancelTextDraft}
                    className="text-xs font-semibold text-gray-600 hover:text-black px-4 py-2 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTextDraft}
                    className="bg-[#00a896] hover:bg-[#009282] text-white font-bold text-xs px-8 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    Save Text
                  </button>
                </div>
              </div>
            );
          }

          // ── CASE 2: NORMAL PAGE CUSTOMIZATION VIEW ────────────────────────
          return (
            <div className="bg-white flex flex-col rounded-none overflow-hidden select-none">
              {/* 1. Modal Top Bar */}
              <div className="h-14 px-5 border-b border-gray-100 flex items-center justify-between">
                {/* Left: Undo / Redo */}
                <div className="flex items-center gap-1.5 text-gray-500">
                  <button
                    type="button"
                    onClick={handleModalUndo}
                    disabled={modalUndoStack.length === 0}
                    className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                      modalUndoStack.length === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100 text-gray-700 cursor-pointer"
                    }`}
                    title="Undo"
                  >
                    <UndoOutlined className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={handleModalRedo}
                    disabled={modalRedoStack.length === 0}
                    className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                      modalRedoStack.length === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-100 text-gray-700 cursor-pointer"
                    }`}
                    title="Redo"
                  >
                    <RedoOutlined className="text-xs" />
                  </button>
                </div>

                {/* Center: Navigation < Page Title > (Screenshot 1: Left gray chevron, Right solid teal circular button) */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handlePrevPageInModal}
                    disabled={currentEditableIndex === 0}
                    className={`p-1 text-gray-400 hover:text-gray-700 transition-colors ${
                      currentEditableIndex === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                    }`}
                    title="Previous Page"
                  >
                    <LeftOutlined className="text-xs font-bold" />
                  </button>
                  <span className="text-xs md:text-sm font-bold text-gray-900 px-1 min-w-[80px] text-center">
                    {pageTitle}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPageInModal}
                    disabled={currentEditableIndex >= allEditablePages.length - 1}
                    className={`w-6 h-6 rounded-full bg-[#00a896] hover:bg-[#008f80] text-white flex items-center justify-center transition-all shadow-xs ${
                      currentEditableIndex >= allEditablePages.length - 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105 active:scale-95"
                    }`}
                    title="Next Page"
                  >
                    <RightOutlined className="text-[10px] font-bold" />
                  </button>
                </div>

                {/* Right: Close (✕) */}
                <button
                  type="button"
                  onClick={() => setEditingModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <CloseOutlined className="text-sm" />
                </button>
              </div>

              {/* 2. Main Canvas Preview Area (Exact 1:1 Rendering of Template Canvas with Sharp Borders) */}
              <div className="p-5 flex flex-col items-center bg-gray-50/50">
                <div
                  ref={canvasContainerRef}
                  onClick={(e) => {
                    if (Date.now() - lastModalElementClickRef.current < 400) {
                      return;
                    }
                    if (
                      e.target === canvasContainerRef.current ||
                      e.target.classList.contains("modal-canvas-clip-layer") ||
                      e.target.classList.contains("modal-bg-canvas-layer")
                    ) {
                      setSelectedModalElementId(null);
                    }
                  }}
                  className="relative w-auto h-[440px] max-h-[58vh] max-w-full rounded-none shadow-md border border-gray-300 overflow-visible select-none bg-white transition-all duration-300"
                  style={{
                    aspectRatio: `${activeSizeInfo.singlePageRatio}`,
                    containerType: "inline-size",
                  }}
                >
                  {/* Clipped Page Content Area (Hides/crops any content overflowing layout or page boundaries) */}
                  <div className="absolute inset-0 overflow-hidden bg-white modal-canvas-clip-layer">
                  {/* Page Background Layer (Image, Gradient, Color with Opacity) */}
                  {(() => {
                    const bg = editingPageDraft.background || {};
                    const isImage =
                      bg.type === "image" ||
                      (typeof bg.value === "string" &&
                        (bg.value.startsWith("http://") ||
                          bg.value.startsWith("https://") ||
                          bg.value.startsWith("/uploads/") ||
                          bg.value.startsWith("data:image/") ||
                          /\.(jpg|jpeg|png|webp|avif|gif|svg)($|\?)/i.test(bg.value)));

                    const bgLayerStyle = {
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      zIndex: 0,
                      opacity: bg.opacity ?? 1,
                    };

                    if (bg.type === "gradient") {
                      bgLayerStyle.background = bg.value;
                    } else if (isImage && bg.value) {
                      const posX = bg.position_x !== undefined ? `${bg.position_x}%` : "50%";
                      const posY = bg.position_y !== undefined ? `${bg.position_y}%` : "50%";
                      const size = bg.scale && bg.scale > 1
                        ? `${Math.round(bg.scale * 100)}%`
                        : (bg.fit_mode || "cover");
                      bgLayerStyle.backgroundImage = `url("${bg.value}")`;
                      bgLayerStyle.backgroundSize = size;
                      bgLayerStyle.backgroundPosition = `${posX} ${posY}`;
                      bgLayerStyle.backgroundRepeat = "no-repeat";
                      bgLayerStyle.backgroundColor = "#ffffff";
                    } else if (bg.value) {
                      bgLayerStyle.backgroundColor = bg.value;
                    } else {
                      bgLayerStyle.backgroundColor = "#ffffff";
                    }

                    return <div className="modal-bg-canvas-layer" style={bgLayerStyle} />;
                  })()}

                  {/* Photo Frames (Exact Template Layout, Coordinates, Paper Borders, and Dimensions) */}
                  {draftFrames.map((frame, idx) => {
                    const coords = getElementCoords(frame);
                    const leftPct = coords.left;
                    const topPct = coords.top;
                    const widthPct = coords.width;
                    const heightPct = coords.height;

                    const displayPhoto =
                      frame.photo_url ||
                      frame.photo?.url ||
                      frame.photo?.preview ||
                      frame.image_url ||
                      frame.url ||
                      frame.src ||
                      frame.test_image_url ||
                      frame.sample_image_url ||
                      "";
                    const hasPhoto = Boolean(displayPhoto);
                    const fitMode = frame.fit_mode || "cover";
                    const borderWidth = frame.border?.width || 0;
                    const borderColor = frame.border?.color || "#ffffff";
                    const frameRefDim = Math.max(
                      50,
                      Math.min(
                        Number(frame.width) > 10 ? Number(frame.width) : (coords.width * 10),
                        Number(frame.height) > 10 ? Number(frame.height) : (coords.height * 10)
                      ) || 400
                    );
                    const normalizedBorderStroke = borderWidth / frameRefDim;
                    const shadow = frame.shadow || {};
                    const shadowFilter =
                      shadow.blur > 0
                        ? `drop-shadow(${shadow.offsetX || 0}px ${shadow.offsetY || 4}px ${shadow.blur}px ${
                            shadow.color || "rgba(0,0,0,0.15)"
                          })`
                        : "none";

                    const shape = frame.shape || frame.mask_shape || "rectangle";
                    const isCircle = shape === "circle";
                    const is1to1Shape = ["circle", "heart", "star", "scallop", "hexagon"].includes(shape);
                    const radiusVal = frame.border?.radius ?? frame.corner_radius ?? (isCircle ? 50 : 0);
                    const clipDef = getShapeClipPathDefinition(shape, radiusVal);
                    const clipId = `modal-clip-${editingPageDraft?.page_id || "draft"}-${frame.id || frame.frame_id || idx}`;

                    const cropZoom = frame.crop?.zoom || 1;
                    const cropOffsetX = frame.crop?.offsetX || 0;
                    const cropOffsetY = frame.crop?.offsetY || 0;
                    const cropRotation = frame.crop?.rotation || frame.rotation || 0;
                    const isCustomerEditable = frame.is_customer_editable !== false;
                    const isSelected = isCustomerEditable && selectedModalElementId === (frame.id || frame.frame_id);

                    return (
                      <div
                        key={frame.id || idx}
                        style={{
                          position: "absolute",
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: is1to1Shape ? undefined : `${heightPct}%`,
                          aspectRatio: is1to1Shape ? "1 / 1" : undefined,
                          zIndex: isSelected ? 99 : (frame.z_index || 1),
                          transform: `rotate(${frame.rotation || 0}deg)`,
                          transformOrigin: "center center",
                          filter: shadowFilter,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          lastModalElementClickRef.current = Date.now();
                          if (isCustomerEditable) {
                            setSelectedModalElementId(frame.id || frame.frame_id);
                          }
                        }}
                        onMouseDown={(e) => {
                          if (isCustomerEditable) {
                            handleModalElementMouseDown(e, frame);
                          }
                        }}
                        className={`group relative overflow-visible transition-all flex items-center justify-center ${
                          isCustomerEditable ? "cursor-move" : "cursor-default"
                        }`}
                      >
                        {/* Hidden SVG with objectBoundingBox clipPath */}
                        <svg width="0" height="0" className="absolute pointer-events-none">
                          <defs>
                            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                              {renderShapeSvgClip(clipDef, false)}
                            </clipPath>
                          </defs>
                        </svg>

                        {/* Clipped container: HTML clipping with clipPathUnits="objectBoundingBox" guarantees 100% boundary locking */}
                        <div
                          className="w-full h-full relative overflow-hidden"
                          style={{
                            clipPath: `url(#${clipId})`,
                            WebkitClipPath: `url(#${clipId})`,
                          }}
                        >
                          {/* Empty background */}
                          <div
                            className="absolute inset-0"
                            style={{ backgroundColor: hasPhoto ? "transparent" : "#f1f5f9" }}
                          />

                          {/* Photo strictly clipped inside */}
                          {hasPhoto && (() => {
                            const isFlipped = Boolean(frame.crop?.flipH || frame.flip_h);
                            return (
                              <img
                                src={displayPhoto}
                                alt=""
                                style={{
                                  position: "absolute",
                                  left: `${cropOffsetX}%`,
                                  top: `${cropOffsetY}%`,
                                  width: "100%",
                                  height: "100%",
                                  objectFit:
                                    fitMode === "contain"
                                      ? "contain"
                                      : fitMode === "stretch" || fitMode === "fill"
                                      ? "fill"
                                      : "cover",
                                  transformOrigin: "50% 50%",
                                  transform: `scale(${isFlipped ? -cropZoom : cropZoom}, ${cropZoom}) rotate(${cropRotation}deg)`,
                                  transition: "transform 0.1s ease",
                                  maxWidth: "none",
                                  maxHeight: "none",
                                  pointerEvents: "none",
                                  userSelect: "none",
                                }}
                              />
                            );
                          })()}

                          {/* Empty placeholder if no photo */}
                          {!hasPhoto && isCustomerEditable && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setTargetPhotoIndexForChange(idx);
                                setIsReplacePhotoModalOpen(true);
                              }}
                              className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 text-slate-400 group-hover:text-amber-600 transition-colors pointer-events-auto cursor-pointer"
                            >
                              <PictureOutlined className="text-xl mb-1 text-slate-400 group-hover:text-amber-500" />
                              <span className="text-[10px] font-semibold text-slate-500 group-hover:text-amber-600">
                                Add Photo
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Border overlay following the exact clip shape */}
                        {borderWidth > 0 && (
                          <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ zIndex: 10 }}
                          >
                            <g
                              transform="scale(100, 100)"
                              fill="none"
                              stroke={borderColor}
                              strokeWidth={normalizedBorderStroke}
                              vectorEffect="non-scaling-stroke"
                            >
                              {renderShapeSvgClip(clipDef, false)}
                            </g>
                          </svg>
                        )}

                        {/* Active Selection Overlay matching Admin InteractiveElement */}
                        {isSelected && (
                          <>
                            {/* Cyan Selection Border */}
                            <div className="absolute inset-0 border-2 border-cyan-400 pointer-events-none shadow-sm z-30" />

                            {/* Floating Quick Action Mini Toolbar */}
                            <div
                              className="absolute -top-18 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/95 text-white border border-slate-700/80 px-2.5 py-1 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto z-[100] text-xs whitespace-nowrap select-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                lastModalElementClickRef.current = Date.now();
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  lastModalElementClickRef.current = Date.now();
                                  setTargetPhotoIndexForChange(idx);
                                  setIsReplacePhotoModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-teal-400 hover:text-teal-300 font-semibold cursor-pointer text-[11px]"
                                title="Change Image"
                              >
                                <PictureOutlined className="text-xs" />
                                <span>Change Image</span>
                              </button>
                              <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
                              <button
                                type="button"
                                title="Flip Image Horizontally"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  lastModalElementClickRef.current = Date.now();
                                  handleToggleModalFrameFlip(frame.id || frame.frame_id);
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-semibold cursor-pointer text-[11px]"
                              >
                                <SwapOutlined className="text-xs" />
                                <span>Flip</span>
                              </button>
                              {!isCoverPage && draftFrames.length > 1 && (
                                <>
                                  <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
                                  <button
                                    type="button"
                                    title="Remove Photo Placeholder"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      lastModalElementClickRef.current = Date.now();
                                      handleDeleteModalFrame(frame.id || frame.frame_id);
                                    }}
                                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 cursor-pointer"
                                  >
                                    <DeleteOutlined className="text-[10px]" />
                                  </button>
                                </>
                              )}
                            </div>

                            {/* 8 Resizing Handles */}
                            {MODAL_RESIZE_HANDLES.map((handle) => (
                              <div
                                key={handle.position}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  lastModalElementClickRef.current = Date.now();
                                }}
                                onMouseDown={(e) => handleModalResizeMouseDown(e, handle, frame)}
                                className="absolute w-3 h-3 bg-white border-2 border-teal-600 rounded-sm pointer-events-auto hover:scale-125 transition-transform z-40"
                                style={{
                                  left: `${handle.xPct * 100}%`,
                                  top: `${handle.yPct * 100}%`,
                                  transform: "translate(-50%, -50%)",
                                  cursor: handle.cursor,
                                }}
                                title={`Resize (${handle.position})`}
                              />
                            ))}

                            {/* Rotation Handle with connecting line */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-0.5 h-6 bg-teal-500 z-30 pointer-events-none" />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                lastModalElementClickRef.current = Date.now();
                              }}
                              onMouseDown={(e) => handleModalRotateMouseDown(e, frame)}
                              className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-teal-600 rounded-full shadow-md pointer-events-auto flex items-center justify-center hover:scale-110 cursor-grab active:cursor-grabbing transition-transform text-teal-700 z-40"
                              title="Rotate element (drag around center)"
                            >
                              <RotateRightOutlined className="text-[11px]" />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* Text Elements: Exact Same Font, Weight, Letter-spacing, Alignment, Height, and Draggable anywhere */}
                  {draftTexts.map((txt) => {
                    const coords = getElementCoords(txt);
                    const leftPct = coords.left;
                    const topPct = coords.top;
                    const widthPct = coords.width;
                    const heightPct = coords.height;

                    const hasExplicitNewlines = txt.content && String(txt.content).includes("\n");
                    const isCustomerEditable = Boolean(txt.is_customer_editable);
                    const isSelected = isCustomerEditable && selectedModalElementId === txt.id;

                    return (
                      <div
                        key={txt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          lastModalElementClickRef.current = Date.now();
                          if (isCustomerEditable) {
                            setSelectedModalElementId(txt.id);
                          }
                        }}
                        onMouseDown={(e) => {
                          if (isCustomerEditable) {
                            handleModalElementMouseDown(e, txt);
                          }
                        }}
                        style={{
                          position: "absolute",
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          maxWidth: "100%",
                          height: txt.height && Number(heightPct) < 80 ? `${heightPct}%` : "auto",
                          color: txt.color || "#1f2937",
                          fontFamily: getFontFamilyFallback(txt.font_family || "Playfair Display"),
                          fontSize: `calc(${Number(txt.font_size || 24)} * (100cqw / 707))`,
                          fontWeight: txt.font_weight || "normal",
                          fontStyle: txt.font_style || "normal",
                          letterSpacing: txt.letter_spacing ? `calc(${Number(txt.letter_spacing)} * (100cqw / 707))` : "normal",
                          lineHeight: txt.line_height || 1.2,
                          textAlign: txt.align || "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            txt.align === "left"
                              ? "flex-start"
                              : txt.align === "right"
                              ? "flex-end"
                              : "center",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: hasExplicitNewlines ? "pre-line" : "normal",
                          transform: `rotate(${txt.rotation || 0}deg)`,
                          transformOrigin: "center center",
                          zIndex: isSelected ? 99 : Math.max(100, Number(txt.z_index) || 100),
                        }}
                        className={`leading-tight ${isCustomerEditable ? "cursor-move hover:outline hover:outline-1 hover:outline-cyan-400" : "cursor-default"} rounded-none transition-all select-none`}
                        title={isCustomerEditable ? "Click to select • Drag to position anywhere" : "Fixed Template Text"}
                      >
                        <span style={{ width: "100%", maxWidth: "100%", whiteSpace: hasExplicitNewlines ? "pre-line" : "normal", wordBreak: "break-word", overflowWrap: "break-word", textAlign: txt.align || "center", fontFamily: "inherit", fontWeight: "inherit", fontStyle: "inherit", letterSpacing: "inherit" }}>
                          {txt.content}
                        </span>

                        {/* Active Selection Overlay for Text */}
                        {isSelected && (
                          <>
                            <div className="absolute inset-0 border-2 border-cyan-400 pointer-events-none shadow-sm z-30" />
                            <div
                              className="absolute -top-18 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/95 text-white border border-slate-700/80 px-2.5 py-1 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto z-[100] text-xs whitespace-nowrap select-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                lastModalElementClickRef.current = Date.now();
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  lastModalElementClickRef.current = Date.now();
                                  handleOpenTextEditor(txt);
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer text-[11px]"
                                title="Edit Text"
                              >
                                <EditOutlined className="text-xs" />
                                <span>Edit Text</span>
                              </button>
                              <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
                              <button
                                type="button"
                                title="Remove Text"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  lastModalElementClickRef.current = Date.now();
                                  handleDeleteTextFromDraft(txt.id);
                                }}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 cursor-pointer"
                              >
                                <DeleteOutlined className="text-[10px]" />
                              </button>
                            </div>

                            {/* 8 Resizing Handles for text */}
                            {MODAL_RESIZE_HANDLES.map((handle) => (
                              <div
                                key={handle.position}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  lastModalElementClickRef.current = Date.now();
                                }}
                                onMouseDown={(e) => handleModalResizeMouseDown(e, handle, txt)}
                                className="absolute w-3 h-3 bg-white border-2 border-teal-600 rounded-sm pointer-events-auto hover:scale-125 transition-transform z-40"
                                style={{
                                  left: `${handle.xPct * 100}%`,
                                  top: `${handle.yPct * 100}%`,
                                  transform: "translate(-50%, -50%)",
                                  cursor: handle.cursor,
                                }}
                                title={`Resize (${handle.position})`}
                              />
                            ))}

                            {/* Rotation Handle for text */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-0.5 h-6 bg-teal-500 z-30 pointer-events-none" />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                lastModalElementClickRef.current = Date.now();
                              }}
                              onMouseDown={(e) => handleModalRotateMouseDown(e, txt)}
                              className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-teal-600 rounded-full shadow-md pointer-events-auto flex items-center justify-center hover:scale-110 cursor-grab active:cursor-grabbing transition-transform text-teal-700 z-40"
                              title="Rotate text (drag around center)"
                            >
                              <RotateRightOutlined className="text-[11px]" />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* Decorative Elements & Stickers */}
                  {draftDecorations.map((rawDec) => {
                    const dec = resolveDbDecorationData(rawDec, extractDatabaseDecorations(templateData));
                    const coords = getElementCoords(dec);
                    const leftPct = coords.left;
                    const topPct = coords.top;
                    const widthPct = coords.width;
                    const heightPct = coords.height;
                    const decSvg = dec.svg || resolveDecorationSvg(dec);

                    return (
                      <div
                        key={dec.id}
                        style={{
                          position: "absolute",
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                          transform: `rotate(${dec.rotation || 0}deg)`,
                          opacity: dec.opacity ?? 1,
                          pointerEvents: "none",
                          zIndex: 15,
                        }}
                        className="flex items-center justify-center overflow-hidden"
                      >
                        {decSvg ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: decSvg }}
                            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                            style={{ color: dec.tint || undefined }}
                          />
                        ) : dec.asset_url ? (
                          <img
                            src={dec.asset_url}
                            alt={dec.name || "Decoration"}
                            style={{
                              objectFit: dec.fit_mode || "contain",
                            }}
                            className="w-full h-full pointer-events-none"
                          />
                        ) : null}
                      </div>
                    );
                  })}
                  </div>
                </div>

                {/* Subtitle Hint */}
                <p className="text-[11px] text-gray-400 mt-2 text-center select-none font-medium">
                  Click any photo or text to rotate, resize, drag or change • Adjust fit & zoom below
                </p>

                {/* Dedicated In-Frame Image Fit & Zoom Controls (No Destructive Cropping!) */}
                {(() => {
                  const selectedFrame = draftFrames.find((f) => (f.id || f.frame_id) === selectedModalElementId);
                  if (!selectedFrame || selectedFrame.is_customer_editable === false) return null;
                  const currentPhoto = selectedFrame.photo_url || selectedFrame.test_image_url || selectedFrame.sample_image_url || selectedFrame.image_url || "";
                  return (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-xl mx-auto bg-white border border-teal-200/90 rounded-2xl p-3.5 shadow-sm flex flex-col gap-2.5 mt-3 animate-fadeIn select-none"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                          <span className="text-xs font-bold text-gray-800">
                            Photo Controls: {selectedFrame.frame_id || "Selected Frame"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const fIdx = draftFrames.findIndex((f) => (f.id || f.frame_id) === (selectedFrame.id || selectedFrame.frame_id));
                            setTargetPhotoIndexForChange(fIdx !== -1 ? fIdx : 0);
                            setIsReplacePhotoModalOpen(true);
                          }}
                          className="bg-[#f97316] hover:bg-orange-600 text-white font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <PictureOutlined />
                          <span>Change Image</span>
                        </button>
                      </div>

                      {/* Row 1: Fit Mode Toggle (Cover, Contain, Stretch) */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">Image Fit:</span>
                        <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl flex-1 max-w-md">
                          {[
                            { key: "cover", label: "Cover", desc: "Fill frame & clip overflow" },
                            { key: "contain", label: "Contain", desc: "Fit entire photo inside frame" },
                            { key: "stretch", label: "Stretch", desc: "Stretch image to fill frame" },
                          ].map((m) => {
                            const isActive = (selectedFrame.fit_mode || "cover") === m.key;
                            return (
                              <button
                                key={m.key}
                                type="button"
                                onClick={() => handleUpdateModalFrameFit(selectedFrame.id || selectedFrame.frame_id, m.key)}
                                className={`py-1 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                                  isActive
                                    ? "bg-[#00a896] text-white shadow-xs"
                                    : "text-gray-600 hover:text-black hover:bg-white/60"
                                }`}
                                title={m.desc}
                              >
                                {m.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 2: In-Frame Zoom Controls */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">Photo Zoom:</span>
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <button
                            type="button"
                            onClick={() => handleUpdateModalFrameZoom(selectedFrame.id || selectedFrame.frame_id, (selectedFrame.crop?.zoom || 1) - 0.1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm cursor-pointer transition-colors"
                            title="Zoom Out (-)"
                          >
                            -
                          </button>
                          <Slider
                            min={0.8}
                            max={3.0}
                            step={0.05}
                            value={selectedFrame.crop?.zoom || 1}
                            onChange={(v) => handleUpdateModalFrameZoom(selectedFrame.id || selectedFrame.frame_id, v)}
                            className="flex-1 my-0"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateModalFrameZoom(selectedFrame.id || selectedFrame.frame_id, (selectedFrame.crop?.zoom || 1) + 0.1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm cursor-pointer transition-colors"
                            title="Zoom In (+)"
                          >
                            +
                          </button>
                          <span className="text-xs font-mono font-bold text-teal-700 w-12 text-right">
                            {Math.round((selectedFrame.crop?.zoom || 1) * 100)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => handleResetModalFrameZoom(selectedFrame.id || selectedFrame.frame_id)}
                            className="text-[10px] text-gray-400 hover:text-teal-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Reset Zoom to 100%"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Row 3: Pan X & Pan Y (Visible if photo is zoomed or panned) */}
                      {((selectedFrame.crop?.zoom || 1) > 1.05 || (selectedFrame.crop?.offsetX || 0) !== 0 || (selectedFrame.crop?.offsetY || 0) !== 0) && (
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">Pan X:</span>
                            <Slider
                              min={-50}
                              max={50}
                              step={1}
                              value={selectedFrame.crop?.offsetX || 0}
                              onChange={(ox) => handleUpdateModalFrameCropOffset(selectedFrame.id || selectedFrame.frame_id, ox, undefined)}
                              className="flex-1 my-0"
                            />
                            <span className="font-mono text-[10px] text-gray-400 w-6 text-right">{selectedFrame.crop?.offsetX || 0}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">Pan Y:</span>
                            <Slider
                              min={-50}
                              max={50}
                              step={1}
                              value={selectedFrame.crop?.offsetY || 0}
                              onChange={(oy) => handleUpdateModalFrameCropOffset(selectedFrame.id || selectedFrame.frame_id, undefined, oy)}
                              className="flex-1 my-0"
                            />
                            <span className="font-mono text-[10px] text-gray-400 w-6 text-right">{selectedFrame.crop?.offsetY || 0}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* 3. "On this cover" / "On this page" Row */}
              {(() => {
                const editableDraftFrames = draftFrames.filter((f) => f.is_customer_editable !== false);
                const editableDraftTexts = draftTexts.filter((t) => Boolean(t.is_customer_editable));
                const totalEditableItems = editableDraftFrames.length + editableDraftTexts.length;

                return (
                  <div className="px-6 py-3 border-t border-gray-100 flex flex-col gap-2 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                        <span className="text-amber-500 text-sm">📁</span>
                        <span>On this {isCoverPage ? "cover" : "page"}</span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center">
                        {totalEditableItems}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {/* Photo Element Cards with Select, Fit & Zoom & Change Actions */}
                      {editableDraftFrames.map((frame) => {
                        const originalIdx = draftFrames.findIndex((f) => (f.id || f.frame_id) === (frame.id || frame.frame_id));
                        const idx = originalIdx !== -1 ? originalIdx : 0;
                        const thumbUrl = frame.photo_url || frame.test_image_url || frame.sample_image_url || frame.image_url || "";
                        const isCircle = frame.shape === "circle";
                        const isSelected = selectedModalElementId === (frame.id || frame.frame_id);
                        return (
                          <div key={frame.id || idx} className="flex flex-col items-center gap-1 shrink-0">
                            <div
                              onClick={() => {
                                lastModalElementClickRef.current = Date.now();
                                setSelectedModalElementId(frame.id || frame.frame_id);
                                if (!thumbUrl) {
                                  setTargetPhotoIndexForChange(idx);
                                  setIsReplacePhotoModalOpen(true);
                                }
                              }}
                              className={`relative w-14 h-14 ${
                                isCircle ? "rounded-full" : "rounded-lg"
                              } overflow-hidden border-2 ${
                                isSelected ? "border-cyan-500 ring-2 ring-cyan-200" : "border-slate-200 hover:border-teal-500"
                              } shadow-2xs bg-gray-100 cursor-pointer transition-colors`}
                              title={thumbUrl ? "Click to Select & Adjust Fit/Zoom" : "Click to Add Photo"}
                            >
                              {thumbUrl ? (
                                <img src={thumbUrl} alt="" className="w-full h-full object-cover pointer-events-none" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <PictureOutlined className="text-lg" />
                                </div>
                              )}
                              {thumbUrl && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePhotoFromDraft(idx);
                                  }}
                                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center text-[9px] transition-colors cursor-pointer"
                                  title="Remove Photo"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {thumbUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    lastModalElementClickRef.current = Date.now();
                                    setSelectedModalElementId(frame.id || frame.frame_id);
                                  }}
                                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[9px] px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-0.5"
                                  title="Select Photo Frame to Adjust Fit & Zoom"
                                >
                                  <ZoomInOutlined className="text-[8px]" />
                                  <span>Fit & Zoom</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  lastModalElementClickRef.current = Date.now();
                                  setSelectedModalElementId(frame.id || frame.frame_id);
                                  setTargetPhotoIndexForChange(idx);
                                  setIsReplacePhotoModalOpen(true);
                                }}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[9px] px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer flex items-center gap-0.5"
                                title={thumbUrl ? "Change Photo" : "Add Photo"}
                              >
                                <PictureOutlined className="text-[8px]" />
                                <span>{thumbUrl ? "Change" : "Add"}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Text Element Cards (Only Customer Editable Texts!) */}
                      {editableDraftTexts.map((txt) => {
                        const isSelected = selectedModalElementId === txt.id;
                        return (
                          <div
                            key={txt.id}
                            onClick={() => {
                              lastModalElementClickRef.current = Date.now();
                              setSelectedModalElementId(txt.id);
                              handleOpenTextEditor(txt);
                            }}
                            className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                          >
                            <div
                              className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 ${
                                isSelected
                                  ? "border-cyan-500 ring-2 ring-cyan-200 bg-cyan-50/20"
                                  : "border-slate-200 bg-slate-50 group-hover:border-teal-500 group-hover:bg-teal-50/30"
                              } flex flex-col items-center justify-center p-1 text-center shadow-2xs transition-all`}
                            >
                              <span className="text-xs font-bold leading-none mb-0.5 text-slate-700">
                                Aa
                              </span>
                              <span className="text-[8px] font-semibold text-gray-700 truncate w-full text-center px-0.5">
                                {txt.content || "Text"}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTextFromDraft(txt.id);
                                }}
                                className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center text-[8px] transition-colors cursor-pointer"
                                title="Remove Text"
                              >
                                ✕
                              </button>
                            </div>
                            <span className="text-[9px] font-bold px-1 py-0.5 text-slate-500 group-hover:text-teal-600">
                              Edit Text
                            </span>
                          </div>
                        );
                      })}

                      {/* Direct "+ Add photo" Button (Only for Interior Pages, NOT for Covers) */}
                      {!isCoverPage && (
                        <button
                          type="button"
                          onClick={() => {
                            if (draftFrames.length >= 4) {
                              message.warning("A maximum of 4 photos can be added to this page.");
                              return;
                            }
                            setTargetPhotoIndexForChange(null);
                            setIsReplacePhotoModalOpen(true);
                          }}
                          className="w-20 h-14 rounded-none border-2 border-dashed border-orange-300 hover:border-[#f97316] hover:bg-orange-50/50 text-[#f97316] flex flex-col items-center justify-center transition-all cursor-pointer shrink-0"
                          title="Add Photo to this page"
                        >
                          <span className="text-base font-bold leading-none">+</span>
                          <span className="text-[9px] font-bold mt-0.5">Add photo</span>
                        </button>
                      )}

                      {/* "+ Add text" Button (Available for Both Pages and Covers) */}
                      <button
                        type="button"
                        onClick={() => handleOpenTextEditor(null)}
                        className="w-16 h-14 rounded-none border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 text-gray-500 flex flex-col items-center justify-center transition-all cursor-pointer shrink-0"
                        title={isCoverPage ? "Add text to this cover" : "Add text to this page"}
                      >
                        <span className="text-xs font-serif font-bold leading-none">Aa</span>
                        <span className="text-[9px] font-bold mt-0.5">+ Text</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 4. "⊞ Layout" Row (Only on Interior Pages - NOT on Front & Back Covers) */}
              {!isCoverPage && (
                <div className="px-6 py-3 border-t border-gray-100 flex flex-col gap-2 bg-white">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <span className="text-amber-500 text-sm">⊞</span>
                    <span>Layout</span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {getLayoutPresetsForCount(draftFrames.length).map((preset) => {
                      const isSelected = selectedLayoutId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectLayoutPreset(preset.id)}
                          className={`relative w-28 h-20 rounded-xl border p-2 flex flex-col items-center justify-between text-center cursor-pointer transition-all shrink-0 ${
                            isSelected
                              ? "border-2 border-[#f97316] bg-orange-50/30 text-gray-900 shadow-2xs font-semibold"
                              : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                          }`}
                        >
                          {/* Green indicator dot on Theme preset if active (Screenshot 1) */}
                          {isSelected && preset.id === "theme" && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
                          )}
                          <div className="w-8 h-6 flex items-center justify-center">
                            {renderLayoutWireframe(preset.id, draftFrames.length, isSelected)}
                          </div>
                          <div className="flex flex-col items-center w-full">
                            <span className="text-[11px] font-bold leading-tight truncate w-full">
                              {preset.label}
                            </span>
                            <span className="text-[8px] text-gray-400 truncate w-full">
                              {preset.subtitle}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Modal Footer (Screenshot 1: Cancel & solid teal Apply) */}
              <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between bg-white">
                <button
                  type="button"
                  onClick={() => setEditingModalOpen(false)}
                  className="text-xs font-semibold text-gray-600 hover:text-black px-4 py-2 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyPageDraft}
                  className="bg-[#00a896] hover:bg-[#009282] text-white font-bold text-xs px-8 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Photoshop-Style Crop & Transform Modal ───────────────────────── */}
      <CropPhotoModal
        frame={cropModalFrame}
        onClose={() => setCropModalFrame(null)}
        onApply={handleApplyPhotoCrop}
      />

      {/* ── Replace / Add Photo Modal ───────────────────────────────────────── */}
      <Modal
        open={isReplacePhotoModalOpen}
        onCancel={() => {
          setIsReplacePhotoModalOpen(false);
          setTargetPhotoIndexForChange(null);
          setTargetPhotoSlot(null);
        }}
        footer={null}
        centered
        width={580}
        title={
          <div className="flex items-center justify-between pr-4">
            <span className="font-bold text-sm text-gray-800">
              {targetPhotoSlot
                ? "Select Photo for Frame"
                : targetPhotoIndexForChange !== null
                ? "Replace Photo"
                : "Add Photo to Page"}
            </span>
          </div>
        }
      >
        <div className="p-2 flex flex-col gap-3">
          <input
            ref={replaceFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleModalFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => replaceFileInputRef.current?.click()}
            className="w-full bg-[#00a896] hover:bg-[#008f80] text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UploadOutlined />
            <span>Upload New Photo from Device</span>
          </button>

          <p className="text-xs text-gray-500 font-medium mt-1">
            Or choose from your uploaded photos:
          </p>

          <div className="grid grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
            {uploadedPhotos.map((photo, pIdx) => (
              <div
                key={photo.id || pIdx}
                onClick={() => {
                  if (targetPhotoSlot) {
                    handleFrameDrop(targetPhotoSlot, photo);
                    setTargetPhotoSlot(null);
                    setIsReplacePhotoModalOpen(false);
                  } else if (targetPhotoIndexForChange !== null) {
                    handleReplacePhotoInDraft(photo);
                  } else {
                    handleAddPhotoToDraft(photo);
                  }
                }}
                className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#00a896] cursor-pointer shadow-xs transition-all bg-black"
              >
                <img src={photo.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                  Select
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* ── Add to Cart or Stay Here Modal ── */}
      <Modal
        open={isAddToCartConfirmModalOpen}
        onCancel={() => setIsAddToCartConfirmModalOpen(false)}
        footer={null}
        centered
        width={500}
        destroyOnClose
        styles={{ body: { padding: "28px" } }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-[#00a896] mb-3 shadow-xs">
            <CheckCircleOutlined className="text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            All Photos Uploaded! 🎉
          </h3>
          <p className="text-xs text-gray-500 mb-5 max-w-sm">
            Every photo holder in your photo book is filled with photos. Would you like to proceed to your cart or stay here to continue customizing?
          </p>

          <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left mb-6 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Template</span>
              <span className="font-bold text-gray-800">{selectedTemplateName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Size</span>
              <span className="font-bold text-gray-800">{activeSizeInfo?.dimensions || activeSizeInfo?.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Edition</span>
              <span className="font-bold text-gray-800">{selectedVariant}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Total Pages</span>
              <span className="font-bold text-gray-800">{photoBookPages} Pages</span>
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-gray-800">Total Price (incl. GST)</span>
              <span className="text-base font-bold text-[#00a896]">₹{priceDetails.finalTotal}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              type="button"
              onClick={handleStayHere}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Stay Here
            </button>
            <button
              type="button"
              disabled={isAddingToCart}
              onClick={handleExecuteAddToCart}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#00a896] hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isAddingToCart ? (
                <Spin size="small" />
              ) : (
                <>
                  <ShoppingCartOutlined className="text-sm" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PhotoBookEditorPage;
