#!/usr/bin/env ruby
# AUDIT-READS: DOCS
# Links inside the documentation that point at a heading nobody wrote, or wrote and then renamed.
#
#     ruby bin/design/doc-link-audit.rb
#
# **Extracted from page-audit.rb on 2026-09-23**, where this lived as a few dozen lines bolted
# onto an otherwise Rails/ERB-specific script. It's the one piece of that file with zero Rails
# coupling -- no `Rails.`, no ERB, just `File.read` and regex over `.md` files -- so it's also the
# one piece of Phase 3's genericization that didn't need reimplementing, only extracting. See
# docs/portability/phase-3-source-audits.md for the fuller reasoning.
#
# Seven of these accumulated during the Human Essentials migration this was extracted from, and
# every one turned out to be a section that had been renamed rather than one that never existed --
# `#target-size` had become "Tap targets", `#pills` "Status pills" -- plus two written as bare
# fragments while pointing at a heading in a different file. A cross-reference that silently goes
# nowhere is worse than no cross-reference, because the reader assumes the explanation exists and
# cannot find it.
#
# Exit codes: 0 nothing dead, 1 at least one dead link.

ROOT = File.expand_path("../..", __dir__)
Dir.chdir(ROOT)

# Recurses into subdirectories -- docs/portability/*.md would be invisible to a bare `docs/*.md`
# glob, and a doc-link checker that cannot see its own working notes is a strange thing to ship.
DOCS = ["design.md", *Dir["docs/**/*.md"]].select { |f| File.exist?(f) }

def slugs_in(path)
  text = File.read(path)
  ids = text.scan(/<a id="([^"]+)"/).flatten
  # `1,6` and not `2,6`: a document with h1 part-dividers needs those counted too, or its own
  # table of contents reports as broken. A false positive in the checker, caught by reading what
  # it accused rather than trusting the count.
  headings = text.scan(/^\#{1,6}\s+(.+)$/).flatten
    .map { |h| h.downcase.gsub(/[^a-z0-9 -]/, "").tr(" ", "-") }
  (ids + headings).to_set
end

SLUGS = DOCS.to_h { |f| [f, slugs_in(f)] }

dead_links = DOCS.flat_map { |f|
  text = File.read(f)
  same = text.scan(/\]\(#([a-z0-9-]+)\)/).flatten.reject { |a| SLUGS[f].include?(a) }
    .map { |a| "#{f}: ##{a}" }
  # **Resolved against the file holding the link, not the working directory.** A version that
  # looked up a relative path as written, found no entry, and fell through to `!File.exist?` would
  # read "cannot find the file" as "fine" -- which passes a link whose target is being renamed out
  # from under it in the same commit. A link the checker cannot resolve is a defect, not a skip.
  cross = text.scan(%r{\]\(([\w./-]+\.md)#([a-z0-9-]+)\)}).reject { |target, frag|
    resolved = File.expand_path(target, File.dirname(f)).delete_prefix("#{Dir.pwd}/")
    SLUGS[resolved]&.include?(frag)
  }.map { |target, frag| "#{f}: #{target}##{frag}" }
  same + cross
}.uniq

if dead_links.empty?
  puts "#{DOCS.size} document(s) checked, no dead links."
  exit 0
end

puts "== documentation links pointing at a heading that does not exist (#{dead_links.size})"
dead_links.sort.each { |l| puts format("    DEFECT  %s", l) }
puts
puts "#{DOCS.size} document(s) checked, #{dead_links.size} dead link(s)."
exit 1
