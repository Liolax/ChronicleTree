# frozen_string_literal: true

# Comprehensive audit logging concern for tracking user activities
# Provides detailed logging of all user actions for security and compliance
module AuditLogging
  extend ActiveSupport::Concern

  included do
    before_action :log_request_start
    after_action :log_user_activity
    around_action :audit_action_performance
  end

  private

  def log_request_start
    @audit_start_time = Time.current
    
    Rails.logger.info({
      event: 'request_start',
      request_id: request.uuid,
      user_id: current_user&.id,
      user_email: current_user&.email,
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      method: request.method,
      path: request.path,
      params: filtered_params,
      timestamp: @audit_start_time,
      session_id: session.id
    }.to_json)
  end

  def log_user_activity
    return unless current_user

    duration = Time.current - @audit_start_time if @audit_start_time

    # Determine action type
    action_type = case action_name
    when 'create' then 'CREATE'
    when 'update' then 'UPDATE'
    when 'destroy' then 'DELETE'
    when 'show', 'index' then 'READ'
    else 'ACTION'
    end

    # Extract resource information
    resource_info = extract_resource_info

    Rails.logger.info({
      event: 'user_activity',
      request_id: request.uuid,
      user_id: current_user.id,
      user_email: current_user.email,
      action_type: action_type,
      controller: controller_name,
      action: action_name,
      resource_type: resource_info[:type],
      resource_id: resource_info[:id],
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      response_status: response.status,
      duration_ms: duration ? (duration * 1000).round(2) : nil,
      timestamp: Time.current,
      session_id: session.id,
      success: response.successful?
    }.to_json)

    # Log specific genealogical actions
    log_genealogical_activity if genealogical_action?
  end

  def audit_action_performance
    start_time = Time.current
    
    begin
      yield
    rescue => e
      # Log errors with full context
      Rails.logger.error({
        event: 'request_error',
        request_id: request.uuid,
        user_id: current_user&.id,
        error_class: e.class.name,
        error_message: e.message,
        error_backtrace: e.backtrace&.first(10),
        controller: controller_name,
        action: action_name,
        params: filtered_params,
        ip_address: request.remote_ip,
        timestamp: Time.current
      }.to_json)
      
      raise e
    ensure
      duration = Time.current - start_time
      
      Rails.logger.info({
        event: 'request_completed',
        request_id: request.uuid,
        user_id: current_user&.id,
        controller: controller_name,
        action: action_name,
        duration_ms: (duration * 1000).round(2),
        status: response.status,
        timestamp: Time.current
      }.to_json)
    end
  end

  def log_genealogical_activity
    case controller_name
    when 'people'
      log_person_activity
    when 'relationships'
      log_relationship_activity
    when 'media'
      log_media_activity
    when 'shares'
      log_sharing_activity
    end
  end

  def log_person_activity
    person_id = params[:id] || @person&.id
    
    Rails.logger.info({
      event: 'genealogy_person_activity',
      request_id: request.uuid,
      user_id: current_user.id,
      action: action_name,
      person_id: person_id,
      person_name: @person ? "#{@person.first_name} #{@person.last_name}" : nil,
      changes: @person&.previous_changes&.except('updated_at'),
      timestamp: Time.current
    }.to_json)
  end

  def log_relationship_activity
    Rails.logger.info({
      event: 'genealogy_relationship_activity',
      request_id: request.uuid,
      user_id: current_user.id,
      action: action_name,
      relationship_id: params[:id],
      relationship_type: params.dig(:relationship, :relationship_type),
      person_ids: [params.dig(:relationship, :person_id), params.dig(:relationship, :relative_id)].compact,
      timestamp: Time.current
    }.to_json)
  end

  def log_media_activity
    Rails.logger.info({
      event: 'genealogy_media_activity',
      request_id: request.uuid,
      user_id: current_user.id,
      action: action_name,
      media_id: params[:id],
      attachable_type: @media&.attachable_type,
      attachable_id: @media&.attachable_id,
      file_size: @media&.file&.blob&.byte_size,
      content_type: @media&.file&.blob&.content_type,
      timestamp: Time.current
    }.to_json)
  end

  def log_sharing_activity
    Rails.logger.info({
      event: 'genealogy_sharing_activity',
      request_id: request.uuid,
      user_id: current_user.id,
      action: action_name,
      share_type: params[:share_type],
      person_id: params[:person_id],
      generations: params[:generations],
      platform: params[:platform],
      timestamp: Time.current
    }.to_json)
  end

  def extract_resource_info
    # Extract resource information from params or instance variables
    case controller_name
    when 'people'
      { type: 'Person', id: params[:id] || @person&.id }
    when 'relationships'
      { type: 'Relationship', id: params[:id] || @relationship&.id }
    when 'media'
      { type: 'Media', id: params[:id] || @media&.id }
    when 'timeline_items'
      { type: 'TimelineItem', id: params[:id] || @timeline_item&.id }
    when 'facts'
      { type: 'Fact', id: params[:id] || @fact&.id }
    else
      { type: controller_name.classify, id: params[:id] }
    end
  end

  def genealogical_action?
    %w[people relationships media timeline_items facts shares].include?(controller_name)
  end

  def filtered_params
    # Filter sensitive parameters for logging
    params.except(:password, :password_confirmation, :current_password)
          .to_unsafe_h
          .deep_transform_values { |v| v.is_a?(ActionDispatch::Http::UploadedFile) ? "[FILE]" : v }
  end

  # Security event logging
  def log_security_event(event_type, details = {})
    Rails.logger.warn({
      event: 'security_event',
      event_type: event_type,
      request_id: request.uuid,
      user_id: current_user&.id,
      user_email: current_user&.email,
      ip_address: request.remote_ip,
      user_agent: request.user_agent,
      details: details,
      timestamp: Time.current
    }.to_json)
  end

  # Data access logging for compliance
  def log_data_access(resource_type, resource_id, access_type = 'READ')
    Rails.logger.info({
      event: 'data_access',
      request_id: request.uuid,
      user_id: current_user&.id,
      resource_type: resource_type,
      resource_id: resource_id,
      access_type: access_type,
      ip_address: request.remote_ip,
      timestamp: Time.current
    }.to_json)
  end
end
