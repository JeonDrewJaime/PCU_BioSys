const { db, auth} = require('../config/admin_config');

class AdminModel {

  async deleteAcademicYears(academicYears) {
    try {
      const updates = {};
  
      academicYears.forEach(year => {
        updates[`schedule_test/academic_years/${year}`] = null;
      });
  
      await db.ref().update(updates);
  
      console.log(`✅ Academic years deleted successfully: ${academicYears.join(', ')}`);
      return { message: `Academic years deleted successfully.`, deleted: academicYears };
    } catch (error) {
      console.error(`❌ Error deleting academic years:`, error);
      throw new Error('Failed to delete academic years');
    }
  }


  async editCourseDetails(instructorNames, academicYear, semester, updatedCourseData) {
    try {
      if (!Array.isArray(instructorNames) || instructorNames.length === 0 || !academicYear || !semester || !updatedCourseData) {
        return { success: false, message: 'Invalid parameters.' };
      }
  
      const scheduleRef = db.ref('schedule_test/academic_years/');
      const snapshot = await scheduleRef.get();
  
      if (!snapshot.exists()) {
        return { success: false, message: 'No schedules found' };
      }
  
      const updates = {};
      const data = snapshot.val();
      let coursesUpdated = 0;
      let instructorsFound = 0;
  
      // Check if the specified academic year and semester exist
      const academicYearData = data[academicYear];
      if (academicYearData) {
        const semesters = academicYearData.semesters[semester];
        if (semesters) {
          const courses = semesters.courses || {};
  
          // Loop through each course and check if any of the instructors are in the list
          Object.keys(courses).forEach((courseIndex) => {
            const course = courses[courseIndex];
            const instructors = course.instructors || {};
  
            // Check if the instructor names match
            Object.keys(instructors).forEach((instIndex) => {
              const instructor = instructors[instIndex];
  
              if (instructorNames.includes(instructor.name)) {
                instructorsFound++;
  
                // Update the course details
                console.log(`Updating course at index "${courseIndex}" for instructor "${instructor.name}".`);
  
                // Update course description, curriculum, and course code based on the provided data
                if (updatedCourseData.course_code) {
                  course.course_code = updatedCourseData.course_code;
                }
                if (updatedCourseData.course_description) {
                  course.course_description = updatedCourseData.course_description;
                }
                if (updatedCourseData.curriculum) {
                  course.curriculum = updatedCourseData.curriculum;
                }
  
                // Add the updated course to the update queue
                updates[`schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${courseIndex}`] = course;
                coursesUpdated++;
              }
            });
          });
        }
      }
  
      // If no instructors were found for the given instructor names
      if (instructorsFound === 0) {
        return { success: false, message: `No courses found for the provided instructors in ${academicYear} ${semester}.` };
      }
  
      // Perform the update after collecting all changes
      await db.ref().update(updates);
  
      return { success: true, message: `${coursesUpdated} course(s) updated successfully for the specified instructors.` };
    } catch (error) {
      console.error('❌ Error editing course details:', error);
      throw new Error('Failed to edit course details');
    }
  }
  

  async deleteCoursesByInstructorNames(instructorNames, academicYear, semester) {
    try {
      if (!Array.isArray(instructorNames) || instructorNames.length === 0 || !academicYear || !semester) {
        return { success: false, message: 'Invalid parameters.' };
      }
  
      const scheduleRef = db.ref('schedule_test/academic_years/');
      const snapshot = await scheduleRef.get();
  
      if (!snapshot.exists()) {
        return { success: false, message: 'No schedules found' };
      }
  
      const updates = {};
      const data = snapshot.val();
      let coursesDeleted = 0;
      let instructorsFound = 0;
      let courseIndexesToDelete = [];
  
      // Check if the specified academic year and semester exist
      const academicYearData = data[academicYear];
      if (academicYearData) {
        const semesters = academicYearData.semesters[semester];
        if (semesters) {
          const courses = semesters.courses || {};
  
          // Loop through each course and check if any of the instructors are in the list
          Object.keys(courses).forEach((courseIndex) => {
            const course = courses[courseIndex];
            const instructors = course.instructors || {};
  
            // Check if the instructor names match
            Object.keys(instructors).forEach((instIndex) => {
              const instructor = instructors[instIndex];
  
              if (instructorNames.includes(instructor.name)) {
                instructorsFound++;
  
                // Add this course to the list of courses to be deleted
                if (!courseIndexesToDelete.includes(courseIndex)) {
                  courseIndexesToDelete.push(courseIndex);
                }
  
                console.log(`Course at index "${courseIndex}" with instructor "${instructor.name}" will be deleted.`);
                coursesDeleted++;
              }
            });
          });
        }
      }
  
      // If no courses were found for the given instructors
      if (instructorsFound === 0) {
        return { success: false, message: `No courses found for the provided instructors in ${academicYear} ${semester}.` };
      }
  
      // Delete the courses found in courseIndexesToDelete
      courseIndexesToDelete.forEach(courseIndex => {
        updates[`schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${courseIndex}`] = null;
      });
  
      // Perform the update after collecting all changes
      await db.ref().update(updates);
  
      return { success: true, message: `${coursesDeleted} course(s) deleted successfully for the specified instructors.` };
    } catch (error) {
      console.error('❌ Error deleting courses by instructor names:', error);
      throw new Error('Failed to delete courses by instructor names');
    }
  }
  
  
  async getCoursesByInstructorNames(instructorNames, academicYear, semester) {
    try {
      if (!Array.isArray(instructorNames) || instructorNames.length === 0 || !academicYear || !semester) {
        return { success: false, message: 'Invalid parameters.' };
      }
  
      const scheduleRef = db.ref('schedule_test/academic_years/');
      const snapshot = await scheduleRef.get();
  
      if (!snapshot.exists()) {
        return { success: false, message: 'No schedules found' };
      }
  
      const data = snapshot.val();
      let matchedCourses = [];
  
      const academicYearData = data[academicYear];
      if (academicYearData) {
        const semesters = academicYearData.semesters[semester];
        if (semesters) {
          const courses = semesters.courses || {};
  
          Object.keys(courses).forEach((courseIndex) => {
            const course = courses[courseIndex];
            const instructors = course.instructors || {};
  
            Object.keys(instructors).forEach((instIndex) => {
              const instructor = instructors[instIndex];
  
              if (instructorNames.includes(instructor.name)) {
                matchedCourses.push({
                  id: courseIndex,
                  ...course
                });
              }
            });
          });
        }
      }
  
      return {
        success: true,
        courses: matchedCourses
      };
    } catch (error) {
      console.error('❌ Error getting courses by instructor names:', error);
      return {
        success: false,
        message: 'Error occurred while fetching courses.',
        error: error.message
      };
    }
  }
  

  async updateCoursesAndInstructorNames(courses, academicYear, semester, instructorName) {
    try {
      if (!Array.isArray(courses) || courses.length === 0) {
        throw new Error('Invalid courses array.');
      }

      const scheduleRef = db.ref('schedule_test/academic_years/');
      const snapshot = await scheduleRef.get();

      if (!snapshot.exists()) {
        throw new Error('No schedules found');
      }

      const data = snapshot.val();
      const academicYearData = data[academicYear];
      if (!academicYearData) {
        throw new Error('Academic year not found');
      }

      const semesters = academicYearData.semesters[semester];
      if (!semesters) {
        throw new Error('Semester not found');
      }

      const coursesData = semesters.courses || {};

      const updatedCourses = [];

      // Iterate through the courses array and update each course
      for (const courseData of courses) {
        const { courseIndex, course_code, course_description, curriculum, schedule } = courseData;

        const course = coursesData[courseIndex];
        if (!course) {
          throw new Error(`Course with index ${courseIndex} not found`);
        }

        // Update course details with the provided data
        const updatedCourse = {
          ...course,
          course_code: course_code,  // Update with the new course code
          course_description: course_description, // Update with the new description
          curriculum: curriculum, // Update with the new curriculum
        };

        // Update the instructor's schedule if needed
        if (course.instructors) {
          Object.keys(course.instructors).forEach(instructorIndex => {
            const instructor = course.instructors[instructorIndex];
            if (instructor.name === instructorName) {
              // Update instructor schedule
              course.instructors[instructorIndex].schedule = schedule; // Update with the new schedule data
            }
          });
        }

        // Save the updated course back to the database
        await scheduleRef.child(`${academicYear}/semesters/${semester}/courses/${courseIndex}`).set(updatedCourse);

        // Push the updated course to the response array
        updatedCourses.push(updatedCourse);
      }

      return updatedCourses;
    } catch (error) {
      console.error('❌ Error updating courses:', error);
      throw new Error(error.message || 'Error occurred while updating the courses.');
    }
  }

  async deleteMultipleCoursesByIndex(courseIndices, academicYear, semester) {
    try {
      if (
        !Array.isArray(courseIndices) || 
        courseIndices.length === 0 || 
        !academicYear || 
        !semester
      ) {
        throw new Error('Missing or invalid required parameters.');
      }
  
      const scheduleRef = db.ref('schedule_test/academic_years/');
      const snapshot = await scheduleRef.get();
  
      if (!snapshot.exists()) {
        throw new Error('No schedules found');
      }
  
      const data = snapshot.val();
      const academicYearData = data[academicYear];
      if (!academicYearData) {
        throw new Error('Academic year not found');
      }
  
      const semesterData = academicYearData.semesters[semester];
      if (!semesterData) {
        throw new Error('Semester not found');
      }
  
      const coursesData = semesterData.courses || {};
      const deletedCourses = [];
  
      for (const index of courseIndices) {
        if (!coursesData.hasOwnProperty(index)) {
          console.warn(`⚠️ Course with index ${index} not found — skipping`);
          continue;
        }
  
        await scheduleRef.child(`${academicYear}/semesters/${semester}/courses/${index}`).remove();
        deletedCourses.push(index);
      }
  
      return {
        message: `Deleted ${deletedCourses.length} course(s) successfully.`,
        deletedCourseIndices: deletedCourses,
      };
    } catch (error) {
      console.error('❌ Error deleting courses:', error);
      throw new Error(error.message || 'Error occurred while deleting the courses.');
    }
  }
  

  async getCoursesByInstructors(instructorNames, academicYear, semester) {
    try {
      const snapshot = await db.ref(`courses/${academicYear}/${semester}`).once('value');
      const data = snapshot.val();
      const courses = [];
  
      if (data) {
        for (const [key, course] of Object.entries(data)) {
          if (instructorNames.includes(course.instructor_name)) {
            courses.push({ id: key, ...course });
          }
        }
      }
  
      return courses;
    } catch (error) {
      console.error('❌ Error in getCoursesByInstructors model:', error);
      return [];
    }
  }
  
  
  
  
  
  
  
  async deleteSemesters(academicYear, semesters) {
    try {
      const updates = {};
  
      semesters.forEach(semester => {
        updates[`schedule_test/academic_years/${academicYear}/semesters/${semester}`] = null;
      });
  
      await db.ref().update(updates);
  
      console.log(`✅ Semesters deleted successfully under ${academicYear}: ${semesters.join(', ')}`);
      return {
        message: `Semesters deleted successfully under ${academicYear}.`,
        deleted: semesters,
        academicYear
      };
    } catch (error) {
      console.error(`❌ Error deleting semesters under ${academicYear}:`, error);
      throw new Error('Failed to delete semesters');
    }
  }


  
  async saveSchedule(academicYear, semester, curriculum, row, rowIndex) {
    try {
      if (!row || row.length === 0) return;

      const courseCode = row[2] || `Unknown Course ${rowIndex + 3}`;
      const courseDescription = row[3] || `Unknown Description ${rowIndex + 3}`;
      const instructors = row[9] ? row[9].split(',') : ['Unknown Instructor'];

      const courseRef = db.ref(`schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${rowIndex}`);

      await courseRef.set({
        course_code: courseCode,
        course_description: courseDescription,
        curriculum: curriculum
      });

      console.log(`Saved: ${academicYear} > ${semester} > Course ${rowIndex}: ${courseCode}`);


      for (let instIndex = 0; instIndex < instructors.length; instIndex++) {
        const instructor = instructors[instIndex];
        const instructorRef = db.ref(
          `schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${rowIndex}/instructors/${instIndex}`
        );
        const scheduleRef = db.ref(
          `schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${rowIndex}/instructors/${instIndex}/schedule`
        );

        await instructorRef.set({ name: instructor });
        console.log(`Saved instructor for Course ${rowIndex}: ${instructor}`);

        const scheduleData = {
          day: row[5] || 'Unknown Day',
          start_time: row[6] || 'Unknown Start Time',
          end_time: row[7] || 'Unknown End Time',
          room: row[8] || 'Unknown Room',
          section: row[0] || 'Unknown Section',
          total_units: row[4] || 'Unknown Units'
        };

        await scheduleRef.set(scheduleData);
        console.log(`Saved schedule for Instructor ${instructor}: ${JSON.stringify(scheduleData)}`);
      }
    } catch (error) {
      console.error('Error saving course data to Firebase:', error);
      throw new Error('Failed to save course data');
    }
  }


  async getInstructorSchedule(instructorName) {
    try {
      const scheduleRef = db.ref('schedule_test/academic_years/');
      const snapshot = await scheduleRef.get();
  
      if (!snapshot.exists()) {
        return { success: false, message: 'No schedules found' };
      }
  
      const data = snapshot.val();
      const instructorSchedules = [];
  
      Object.keys(data).forEach((academicYear) => {
        const semesters = data[academicYear].semesters || {};
  
        Object.keys(semesters).forEach((semester) => {
          const courses = semesters[semester].courses || {};
  
          Object.keys(courses).forEach((courseIndex) => {
            const course = courses[courseIndex];
  
            if (course.instructors) {
              Object.values(course.instructors).forEach((instructor) => {
                if (instructor.name === instructorName) {
                  instructorSchedules.push({
                    academicYear,
                    semester,
                    courseTitle: course.course_description || 'Unknown Course',
                    units: instructor.schedule?.total_units || 'Unknown Units',
                    days: instructor.schedule?.day || 'Unknown Day',
                    timeIn: instructor.schedule?.start_time || 'Unknown Start Time',
                    timeOut: instructor.schedule?.end_time || 'Unknown End Time',
                  });
                }
              });
            }
          });
        });
      });
  
      if (instructorSchedules.length === 0) {
        return { success: false, message: 'Instructor schedule not found' };
      }
  
      return { success: true, schedules: instructorSchedules };
    } catch (error) {
      console.error(`❌ Error fetching schedule for ${instructorName}:`, error);
      throw new Error('Failed to fetch instructor schedule');
    }
  }
  
  async getAllSchedules() {  // Renamed for consistency
    try {
      const scheduleRef = db.ref('schedule_test/academic_years/');
      const snapshot = await scheduleRef.get();

      if (!snapshot.exists()) {
        return [];
      }

      const data = snapshot.val();
      return Object.keys(data).map((acadYear) => ({
        acadYear,
        semesters: Object.keys(data[acadYear]?.semesters || {}).map((semesterKey) => {
          const semesterData = data[acadYear].semesters[semesterKey];
          const instructors = {};

          if (semesterData.courses) {
            Object.values(semesterData.courses).forEach((course) => {
              if (course.instructors) {
                Object.values(course.instructors).forEach((instructor) => {
                  if (!instructors[instructor.name]) {
                    instructors[instructor.name] = {
                      name: instructor.name,
                      courses: [],
                    };
                  }
                  instructors[instructor.name].courses.push({
                    courseCode: course.course_code || 'Unknown Code',
                    courseDescription: course.course_description || 'No Description',
                    curriculum: course.curriculum || 'Unknown Curriculum',
                    schedule: instructor.schedule || {},
                  });
                });
              }
              
            });
          }
          return {
            semesterKey,
            instructors: Object.values(instructors),
          };
        }),
      }));
    } catch (error) {
      console.error('❌ Error fetching schedules:', error);
      throw new Error('Failed to fetch schedules');
    }
  }

  async getAllUser() {
    try {
      const facultyRef = db.ref('users/faculty');
      const adminRef = db.ref('users/admin');
  
      // Fetch faculty and admin data in parallel
      const [facultySnapshot, adminSnapshot] = await Promise.all([
        facultyRef.get(),
        adminRef.get()
      ]);
  
      const facultyData = facultySnapshot.exists() ? facultySnapshot.val() : {};
      const adminData = adminSnapshot.exists() ? adminSnapshot.val() : {};
  
      // Convert faculty and admin data into a unified array
      const facultyList = Object.entries(facultyData).map(([id, data]) => ({
        id,
        role: 'faculty',
        ...data
      }));
  
      const adminList = Object.entries(adminData).map(([id, data]) => ({
        id,
        role: 'admin',
        ...data
      }));
  
      // Combine both lists
      return [...facultyList, ...adminList];
  
    } catch (error) {
      console.error('❌ Error fetching users (faculty & admins):', error);
      throw new Error('Failed to fetch user data');
    }
  }
  
async getUserById(userId) {
  try {
  
    const facultyRef = db.ref(`users/faculty/${userId}`);
    const adminRef = db.ref(`users/admin/${userId}`);

    const [facultySnapshot, adminSnapshot] = await Promise.all([
      facultyRef.get(),
      adminRef.get()
    ]);

    if (facultySnapshot.exists()) {
      return { id: userId, role: 'faculty', ...facultySnapshot.val() };
    }

    if (adminSnapshot.exists()) {
      return { id: userId, role: 'admin', ...adminSnapshot.val() };
    }

    return null;

  } catch (error) {
    console.error(`❌ Error fetching user with ID ${userId}:`, error);
    throw new Error('Failed to fetch user data');
  }
}



async editUser(userId, updatedData) {
  try {
    const facultyRef = db.ref(`users/faculty/${userId}`);
    const adminRef = db.ref(`users/admin/${userId}`);

    const [facultySnapshot, adminSnapshot] = await Promise.all([
      facultyRef.get(),
      adminRef.get()
    ]);

    if (facultySnapshot.exists()) {
      await facultyRef.update(updatedData);
      console.log(`✅ Faculty user ${userId} updated successfully.`);
      return { message: `Faculty user ${userId} updated successfully.` };
    }

    if (adminSnapshot.exists()) {
      await adminRef.update(updatedData);
      console.log(`✅ Admin user ${userId} updated successfully.`);
      return { message: `Admin user ${userId} updated successfully.` };
    }

    throw new Error(`User ${userId} not found.`);
  } catch (error) {
    console.error(`❌ Error updating user with ID ${userId}:`, error);
    throw new Error('Failed to update user');
  }
}

async deleteUsers(userIds) {
  try {
    // Create an array of deletion tasks for each user ID
    const deletionTasks = userIds.map(async (userId) => {
      const facultyRef = db.ref(`users/faculty/${userId}`);
      const adminRef = db.ref(`users/admin/${userId}`);

      // Get snapshots for both faculty and admin nodes in parallel
      const [facultySnapshot, adminSnapshot] = await Promise.all([
        facultyRef.get(),
        adminRef.get()
      ]);

      // Delete from faculty node if exists
      if (facultySnapshot.exists()) {
        await facultyRef.remove();
        console.log(`✅ Faculty user ${userId} deleted from database.`);
      }

      // Delete from admin node if exists
      if (adminSnapshot.exists()) {
        await adminRef.remove();
        console.log(`✅ Admin user ${userId} deleted from database.`);
      }

      // Delete user from Firebase Authentication
      await auth.deleteUser(userId);
      console.log(`✅ User ${userId} deleted from Firebase Authentication.`);
    });

    // Execute all deletion tasks concurrently
    await Promise.all(deletionTasks);

    // Return a success message with details
    return {
      message: `Users ${userIds.join(', ')} deleted successfully from database and authentication.`,
      deleted: userIds
    };
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    throw new Error('Failed to delete users');
  }
}
}


module.exports = new AdminModel();