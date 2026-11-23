#!/usr/bin/env ruby
# frozen_string_literal: true

# Fails on British spellings in any tracked text file. This repo is US English only
# (CONTRIBUTING.md). Added 2026-11-23 after British spellings ("colour", "behaviour", "-ise") were
# found across 146 files and converted in commit a95e806.
#
# Exempt: `aria-labelledby`/`ariaLabelledBy...` (the real attribute names) and external URLs,
# which can contain British spellings and would break if changed.
#
# Usage: ruby bin/design/spelling-audit.rb    (exit 1 with file:line for each hit)

ROOT = File.expand_path("../..", __dir__)

SKIP = %r{\A(videos/|package-lock\.json|custom-elements\.json|storybook-static/|dist/)}
BINARY = /\.(mp4|png|jpe?g|gif|ico|woff2?|pdf|tgz)\z/

# Word-level patterns. Each is matched case-insensitively against whole words (hyphenated
# compounds included, so "tone-coloured" is caught).
PATTERNS = [
  /colour/, /behaviour/, /neighbour/, /\b(fav|hon|flav|arm|harb|rum|sav|endeav)our/,
  /\bgrey(s|ed|ing|scale)?\b/, /\bcentr(e|es|ed|ing)\b/, /\bcatalogu(e|es|ed)\b/,
  /\bjudgement/, /\bartefact/, /\bcancell(ed|ing)\b/, /\btravell(ed|ing)\b/,
  /\bsignall(ed|ing)\b/, /\blabell(ed|ing)\b/, /\blicence\b/, /\bfulfilment/,
  /\b(off|def)ence\b/, /\banalys(e|ed|es|ing)\b/,
  /\b\w*(organis|recognis|summaris|initialis|optimis|serialis|normalis|authoris|visualis|
     standardis|apologis|categoris|prioritis|minimis|maximis|customis|realis|utilis|memoris|
     finalis|sanitis|stabilis|synchronis|characteris|specialis|generalis|localis|tokenis|
     capitalis|criticis|emphasis)(e|ed|es|ing|ation|ations|er|ers|able)\b/x,
].freeze

URL = %r{https?://[^\s)\]>"'`]+}
EXEMPT = /aria-?labelledby/i

files = `git -C #{ROOT} ls-files`.split("\n").reject { |f| f.match?(SKIP) || f.match?(BINARY) }
hits = []
files.each do |file|
  path = File.join(ROOT, file)
  next unless File.file?(path)

  File.foreach(path).with_index(1) do |line, n|
    text = line.gsub(URL, " ").gsub(EXEMPT, " ")
    PATTERNS.each do |pat|
      text.scan(Regexp.new(pat.source, Regexp::IGNORECASE | pat.options)) do
        hits << "#{file}:#{n}: #{Regexp.last_match[0]}"
      end
    end
  rescue ArgumentError
    break # not valid UTF-8 text
  end
end

if hits.empty?
  puts "#{files.size} file(s) checked, no British spellings."
else
  puts hits.uniq
  puts "\n#{hits.uniq.size} British spelling(s). This repo is US English only (see CONTRIBUTING.md)."
  exit 1
end
