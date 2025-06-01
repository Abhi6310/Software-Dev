#!/bin/bash

set -eu

log_usage() {
  echo "\
usage: $0 [--reset] [--debug] [--help]

Tests your submission queries
This uses the provided solutions, you will be graded using different data!"
}

WRITE_COMMENTS=0
RESET_VOLUMES=0
while test $# -gt 0; do
  case "$1" in
    --reset)
      RESET_VOLUMES=1
      ;;
    --comments)
      WRITE_COMMENTS=1
      ;;
    --help | -h)
      log_usage
      exit 0
      ;;
    --debug)
      set -x
      ;;
    *)
      echo "Invalid option: $1"
      log_usage
      exit 1
      ;;
  esac
  shift
done

if [ "$RESET_VOLUMES" = "1" ]; then
  docker compose down -v
  docker compose up -d
  sleep 1
fi

execute_query() {
  cat "$1" \
    | docker compose exec -T db psql -U postgres -d movies_db --csv \
      --file=-
}

log_error_and_exit() {
  echo "FAIL: encountered error while testing queries" >&2
  exit 1
}

maybe_colordiff(){
  if which colordiff > /dev/null; then
    colordiff
  else
    cat
  fi
}

trap log_error_and_exit EXIT

NUM_CORRECT=0
NUM_TOTAL=
for query_path in queries/*.sql; do
  NUM_TOTAL=$((NUM_TOTAL + 1))
  expected_path="queries/testdata/$(basename $query_path .sql).csv"
  actual="$(execute_query $query_path)"
  result_diff="$(echo "$actual" | diff -C3 "$expected_path" - || true)"

  # To update the solution, remove queries/testdata and rerun this script.
  if ! [ -f "$expected_path" ]; then
    echo "WARN: writing solution to $expected_path"
    echo "$actual" | tee "$expected_path"
    continue
  fi

  if [ "$result_diff" != "" ]; then
    echo "ERROR: query $query_path is incorrect" >&2
    echo "$result_diff" | maybe_colordiff
  else
    echo "INFO: query $query_path is correct"
    NUM_CORRECT=$((NUM_CORRECT + 1))
  fi

done

if [ "$NUM_CORRECT" = "$NUM_TOTAL" ]; then
  trap "echo PASS $0" EXIT
  exit 0
fi

echo
echo "FAIL: $NUM_CORRECT/$NUM_TOTAL queries are correct" >&2
exit 1
