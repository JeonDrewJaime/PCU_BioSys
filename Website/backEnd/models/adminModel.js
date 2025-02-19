const { db } = require('../config/admin_config');

class AdminModel {
  async saveCourse(academicYear, semester, curriculum, row, rowIndex) {
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

      // Save instructors and schedule
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
  async getAllSchedules() {  // Renamed for consistency
    try {
      const scheduleRef = db.ref('schedule_testing/academic_years/');
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
  }

module.exports = new AdminModel();
