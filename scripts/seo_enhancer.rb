require 'yaml'
require 'stopwords'
require 'lemmatizer'
require 'fileutils'

class SeoEnhancer
  def initialize(options = {})
    # Initialize stopwords filter (common words we want to ignore)
    @filter = Stopwords::Snowball::Filter.new("en")
    @lemmatizer = Lemmatizer.new
    @dry_run = options[:dry_run] || false
    @backup_dir = "seo_backup_#{Time.now.strftime('%Y%m%d_%H%M%S')}"
  end

  def process_site(single_file = nil)
    # Create backup directory if not in dry run mode
    FileUtils.mkdir_p(@backup_dir) unless @dry_run

    if single_file
      process_single_file(single_file)
    else
      # Process both posts and pages
      process_directory("_posts")
      process_directory("_pages") if Dir.exist?("_pages")
    end
  end

  private

  def process_directory(dir)
    Dir.glob("#{dir}/**/*.{md,markdown}") do |file|
      process_single_file(file)
    end
  end

  def process_single_file(file)
    return unless File.exist?(file)
    
    puts "\nProcessing: #{file}"
    # Read the entire content at once and store it in memory
    original_content = File.read(file)
    
    # Split front matter and content
    if original_content =~ /\A(---\s*\n.*?\n?)^(---\s*$\n?)/m
      front_matter = YAML.load($1)
      main_content = original_content[$1.length + $2.length..-1]
      
      # Skip if keywords already exist
      if front_matter['keywords']
        puts "- Skipped (already has keywords)"
        return
      end

      # Generate keywords
      keywords = extract_keywords(main_content, front_matter['title'])
      front_matter['keywords'] = keywords.join(', ')
      
      # Create new content
      new_content = "---\n#{front_matter.to_yaml.sub('---', '')}---#{main_content}"
      
      if @dry_run
        puts "Would add keywords: #{keywords.join(', ')}"
      else
        # Backup original file
        backup_file(file)
        
        # Write new content to file
        File.write(file, new_content)
        puts "✓ Updated #{file}"
        puts "  Added keywords: #{keywords.join(', ')}"
      end
    end
  end

  def backup_file(file)
    backup_path = File.join(@backup_dir, file)
    FileUtils.mkdir_p(File.dirname(backup_path))
    FileUtils.cp(file, backup_path)
  end

  def extract_keywords(content, title)
    # Combine title and content for analysis
    text = "#{title} #{content}"
    
    # Convert to lowercase and split into words
    words = text.downcase.scan(/\b[\w']+\b/)
    
    # Remove stopwords and lemmatize
    words = words.reject { |word| @filter.stopword?(word) }
    words = words.map { |word| @lemmatizer.lemma(word) }
    
    # Count word frequencies
    word_freq = Hash.new(0)
    words.each { |word| word_freq[word] += 1 }
    
    # Select top 5-7 keywords
    word_freq.sort_by { |_, count| -count }
      .first(7)
      .map { |word, _| word }
      .select { |word| word.length > 3 }
  end
end

# Command line interface
if __FILE__ == $0
  require 'optparse'

  options = {}
  OptionParser.new do |opts|
    opts.banner = "Usage: ruby seo_enhancer.rb [options]"

    opts.on("-d", "--dry-run", "Show what would be changed without making changes") do
      options[:dry_run] = true
    end

    opts.on("-f", "--file FILE", "Process single file") do |file|
      options[:single_file] = file
    end

    opts.on("-h", "--help", "Show this help message") do
      puts opts
      exit
    end
  end.parse!

  puts "Starting SEO enhancement..."
  puts "DRY RUN MODE - No changes will be made" if options[:dry_run]
  
  enhancer = SeoEnhancer.new(options)
  enhancer.process_site(options[:single_file])
  
  puts "\nSEO enhancement complete!"
  puts "Backup created in: #{enhancer.instance_variable_get(:@backup_dir)}" unless options[:dry_run]
end 