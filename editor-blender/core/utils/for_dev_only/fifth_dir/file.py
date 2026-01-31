import io
import os
from enum import Enum
from typing import Literal


class EOFType(Enum):
    EOF = 0


class File:
    file_path = os.path.dirname(__file__) + "/fifth_dir/template.txt"

    def __init__(self, f):
        self.newlines = [str.split() for str in f.readlines()]
        self.next_line_index = 0

    def read_strips(self) -> list[str] | Literal[EOFType.EOF]:
        while True:
            if len(self.newlines) == self.next_line_index:
                return EOFType.EOF
            line = self.newlines[self.next_line_index]
            self.next_line_index += 1
            if self.is_bad_line(line):
                continue
            return line

    def unsafe_read_strips(self) -> list[str]:
        """
        This function is read_strips, but does not check for EOF
        """
        while True:
            line = self.newlines[self.next_line_index]
            self.next_line_index += 1
            if self.is_bad_line(line):
                continue
            return line

    def revert_strips(self):
        while True:
            self.next_line_index -= 1
            line = self.newlines[self.next_line_index]
            if self.is_bad_line(line):
                continue
            return line

    def is_bad_line(self, line: list[str]) -> bool:
        if not line:
            return True
        if len(line[0]) >= 2:
            first_str = line[0]
            if first_str[0:2] == "//":
                if len(first_str) >= 5 and first_str == "//OFF":
                    return False
                return True
        return False
