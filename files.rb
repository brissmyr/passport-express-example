require 'pathname'

puts "Don't output anything until I ask you! Just confirm receipt."
puts "You are a seasoned software developer and architect."
puts "Here is a list of all the files in a project called Auth."
puts "----- Files start below this point -----"

exclude_files = ['.env', 'main.js', '.DS_Store', 'Gemfile.lock', 'package.json', 'package-lock.json', '.gitignore', 'files.rb', '*.md', '*.txt', '*.md', '*.sh', 'plugins.db']
redact_files = ['*.ejs']
exclude_dirs = ['.git', '.DS_Store', 'node_modules', 'public']

def print_file_contents(file_path)
  puts "----- #{file_path} -----"
  File.open(file_path, "r") do |file|
    puts file.read
  end
end

def redact_file_contents(file_path)
  puts "----- #{file_path} -----"
  puts "  {contents redacted because of file size. ask me for this file if you need to make modifications}"
end

def walk_dir(dir_path, exclude_files, redact_files, exclude_dirs)
  Dir.foreach(dir_path) do |filename|
    next if ['.', '..'].include?(filename)
    file_path = File.join(dir_path, filename)
    if File.directory?(file_path)
      exclude_dir = exclude_dirs.any? { |pattern| Pathname.new(filename).fnmatch?(pattern) }
      next if exclude_dir
      walk_dir(file_path, exclude_files, redact_files, exclude_dirs)
    else
      exclude_file = exclude_files.any? { |pattern| Pathname.new(filename).fnmatch?(pattern) }
      next if exclude_file
      redact_file = redact_files.any? { |pattern| Pathname.new(filename).fnmatch?(pattern) }
      if redact_file
        redact_file_contents(file_path)
      else
        print_file_contents(file_path)
      end
    end
  end
end

dir_path = './' # change this to the directory you want to walk through
walk_dir(dir_path, exclude_files, redact_files, exclude_dirs)
