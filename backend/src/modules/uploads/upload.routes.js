"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload_controller_1 = require("./upload.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Configure multer memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});
// Routes
router.post('/upload/course-material', auth_middleware_1.authenticateJWT, upload.single('file'), upload_controller_1.uploadCourseMaterial);
router.post('/upload/assignment-submission', auth_middleware_1.authenticateJWT, upload.single('file'), upload_controller_1.uploadAssignmentSubmission);
router.get('/uploads/:folder/:filename', upload_controller_1.getUploadedFile);
exports.default = router;
