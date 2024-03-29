import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { Router, json } from 'express';
import { IReq, IRes } from './types/types';
import Paths from '@src/constants/Paths';
import { asyncHandler } from '@src/util/misc';
// import attendanceService from '@src/services/attendance.service';
// import shiftService from '@src/services/shift.service';
import { RouteError } from '@src/other/classes';
import imageService from '@src/services/image.service';
import multer from 'multer';
import shiftService from '@src/services/shift.service';
import attendanceService from '@src/services/attendance.service';

// ** Add Router ** //

const attendanceRouter = Router();

// **** Variables **** //

const upload = multer();

// **** Types **** //

interface AttendanceRequest {
  shiftId?: string;
  employeeId?: string;
}

// **** Resolvers **** //

const attendanceResolvers = {
  takeAttendance: async (req: IReq<AttendanceRequest>, res: IRes) => {
    const img = req.file;
    console.log('🚀 ~ takeAttendance: ~ img:', img);

    if (!img) {
      throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'Please upload a file');
    }
    const imgBuffer = img.buffer.toString('base64');

    // Search faces in Rekognition collection
    const face = await imageService.searchFace(imgBuffer);
    if (!face.FaceId) throw new RouteError(HttpStatusCodes.NOT_FOUND, 'Face info not found');

    // Get the current shift
    const shiftId = (await shiftService.getCurrentShift()).id;

    // Create check-in record
    const message = await attendanceService.takeAttendance(shiftId, face.FaceId);

    return res.status(HttpStatusCodes.OK).json({
      message: message,
    });
  },
};

// **** Routes **** //

attendanceRouter
  .route(Paths.Attendance.CRUD)
  .post(upload.single('file'), asyncHandler(attendanceResolvers.takeAttendance));

attendanceRouter.use(json({ limit: '10mb' }));

// **** Export default **** //

export default attendanceRouter;
