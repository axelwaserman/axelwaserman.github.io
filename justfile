default:
    @just --list

# Compile the Typst CV source to a committed PDF artifact.
cv:
    typst compile assets/CV.typ public/cv.pdf
