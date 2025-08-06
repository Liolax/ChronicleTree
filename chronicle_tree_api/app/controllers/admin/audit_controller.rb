# frozen_string_literal: true

# Admin controller for audit log management and security monitoring
class Admin::AuditController < ApplicationController
  before_action :ensure_admin

  # GET /admin/audit/logs
  def logs
    page = params[:page]&.to_i || 1
    per_page = 50
    
    # Parse log files for audit events
    logs = parse_audit_logs(page, per_page)
    
    render json: {
      logs: logs,
      pagination: {
        page: page,
        per_page: per_page,
        total: logs.size
      }
    }
  end

  # GET /admin/audit/versions
  def versions
    versions = PaperTrail::Version
               .includes(:item)
               .order(created_at: :desc)
               .limit(100)
    
    formatted_versions = versions.map do |version|
      {
        id: version.id,
        item_type: version.item_type,
        item_id: version.item_id,
        event: version.event,
        user_id: version.whodunnit,
        user_email: version.user_email,
        ip_address: version.ip_address,
        request_id: version.request_id,
        changes: version.changeset,
        created_at: version.created_at
      }
    end
    
    render json: { versions: formatted_versions }
  end

  # GET /admin/audit/security_events
  def security_events
    # Parse security events from logs
    events = parse_security_events
    
    render json: { events: events }
  end

  # GET /admin/audit/rate_limits
  def rate_limits
    # Get current rate limit status
    cache = Rails.cache
    
    # Sample some rate limit keys
    keys = cache.instance_variable_get(:@data)&.keys&.grep(/^rack::attack/) || []
    
    rate_limits = keys.map do |key|
      {
        key: key,
        count: cache.read(key),
        expires_at: cache.instance_variable_get(:@data)[key]&.expires_at
      }
    end
    
    render json: { rate_limits: rate_limits }
  end

  private

  def ensure_admin
    unless current_user&.admin?
      render json: { error: 'Admin access required' }, status: :forbidden
    end
  end

  def parse_audit_logs(page = 1, per_page = 50)
    log_file = Rails.root.join('log', "#{Rails.env}.log")
    return [] unless File.exist?(log_file)
    
    # Read and parse recent log entries
    lines = File.readlines(log_file).last(1000)
    
    audit_lines = lines.select { |line| line.include?('"event":') }
    
    parsed_logs = audit_lines.filter_map do |line|
      begin
        JSON.parse(line.split('INFO -- : ').last || line.split('WARN -- : ').last || line.split('ERROR -- : ').last)
      rescue JSON::ParserError
        nil
      end
    end
    
    # Paginate results
    start_index = (page - 1) * per_page
    parsed_logs.slice(start_index, per_page) || []
  end

  def parse_security_events
    log_file = Rails.root.join('log', "#{Rails.env}.log")
    return [] unless File.exist?(log_file)
    
    lines = File.readlines(log_file).last(500)
    
    security_lines = lines.select do |line|
      line.include?('security_event') || 
      line.include?('suspicious_activity') || 
      line.include?('rate_limited')
    end
    
    security_lines.filter_map do |line|
      begin
        JSON.parse(line.split('WARN -- : ').last || line.split('INFO -- : ').last)
      rescue JSON::ParserError
        nil
      end
    end.last(50)
  end
end
