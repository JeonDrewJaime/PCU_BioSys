const { db, auth} = require('../config/admin_config');

class AdminModel {

  async deleteAcademicYear(academicYear) {
    try {
      const academicYearRef = db.ref(`schedule_test/academic_years/${academicYear}`);
      await academicYearRef.remove();
      console.log(`✅ Academic year ${academicYear} deleted successfully.`);
      return { message: `Academic year ${academicYear} deleted successfully.` };
    } catch (error) {
      console.error(`❌ Error deleting academic year ${academicYear}:`, error);
      throw new Error('Failed to delete academic year');
    }
  }
  
  async deleteInstructorByName(instructorName) {
    try {
      const scheduleRef = db.ref('schedule_test/academic_years/');
      const snapshot = await scheduleRef.get();
  
      if (!snapshot.exists()) {
        return { success: false, message: 'No schedules found' };
      }
  
      const updates = {};
      const data = snapshot.val();
      let found = false;
  
      Object.keys(data).forEach((academicYear) => {
        const semesters = data[academicYear].semesters || {};
  
        Object.keys(semesters).forEach((semester) => {
          const courses = semesters[semester].courses || {};
  
          Object.keys(courses).forEach((courseIndex) => {
            const course = courses[courseIndex];
  
            if (course.instructors) {
              Object.keys(course.instructors).forEach((instIndex) => {
                if (course.instructors[instIndex].name === instructorName) {
                  found = true;
                  updates[`schedule_test/academic_years/${academicYear}/semesters/${semester}/courses/${courseIndex}/instructors/${instIndex}`] = null;
                }
              });
            }
          });
        });
      });
  
      if (!found) {
        return { success: false, message: 'Instructor not found' };
      }
  
      await db.ref().update(updates);
      return { success: true, message: `Instructor ${instructorName} deleted successfully.` };
    } catch (error) {
      console.error(`❌ Error deleting instructor ${instructorName}:`, error);
      throw new Error('Failed to delete instructor');
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

async deleteUser(userId) {
  try {
    const facultyRef = db.ref(`users/faculty/${userId}`);
    const adminRef = db.ref(`users/admin/${userId}`);

    const [facultySnapshot, adminSnapshot] = await Promise.all([
      facultyRef.get(),
      adminRef.get()
    ]);

    if (facultySnapshot.exists()) {
      await facultyRef.remove();
      console.log(`✅ Faculty user ${userId} deleted from database.`);
    }

    if (adminSnapshot.exists()) {
      await adminRef.remove();
      console.log(`✅ Admin user ${userId} deleted from database.`);
    }

    // Delete user from Firebase Authentication
    await auth.deleteUser(userId);
    console.log(`✅ User ${userId} deleted from Firebase Authentication.`);

    return { message: `User ${userId} deleted successfully from database and authentication.` };
    
  } catch (error) {
    console.error(`❌ Error deleting user with ID ${userId}:`, error);
    throw new Error('Failed to delete user');
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

}


module.exports = new AdminModel();