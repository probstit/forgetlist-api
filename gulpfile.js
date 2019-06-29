const gulp = require("gulp");
const ts = require("gulp-typescript");
const project = ts.createProject("./tsconfig.json");

gulp.task("compile-ts", () => {
  return gulp
    .src("src/**/*.ts")
    .pipe(project())
    .pipe(gulp.dest("dist"));
});

// gulp.task('copyENV', () => {
//   gulp.src('./.env')
//     .pipe(gulp.dest('./dist/'));
// })

gulp.task('build', () => {
  gulp.watch('src/**/*.ts', gulp.series("compile-ts"));
});
